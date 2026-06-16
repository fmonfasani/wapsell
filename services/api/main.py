"""Wapsell Auth API — handles user registration, login, and session management."""

from datetime import UTC, datetime, timedelta
import csv
import hashlib
import logging
import os
import secrets
import sqlite3
import tempfile
import time
import json
import urllib.request
from typing import Optional
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, Request, Response, UploadFile, File, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, EmailStr, field_validator

# Load environment variables
load_dotenv()

# Configure logging. Level is env-configurable (default INFO in prod; set
# WAPSELL_LOG_LEVEL=DEBUG locally). Avoid DEBUG in production.
logging.basicConfig(
    level=getattr(logging, os.getenv("WAPSELL_LOG_LEVEL", "INFO").upper(), logging.INFO),
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('api.log'),
        logging.StreamHandler()
    ]
)

# Hermes/Waseller imports
from wapsell.client import WapsellClient
from wapsell.models import Fact, Tenant
from wapsell.llm.port import OpenRouterLLM

# Buyer Persona & Adaptive Response System
from buyer_personas import (
    PersonaDetector, ResponseTemplateGenerator, PersonaType, PersonaInsights
)
from buyer_profile_manager import BuyerProfileManager

# Wapsell sales agent knowledge base (the demo sells Wapsell itself).
import wapsell_sales

from integrations.mercadolibre.db import init_ml_tables
from integrations.mercadolibre.router import router as mercadolibre_router

# Catalog extraction & loading
from extractors_tokko import TokkoExtractor
from loader_catalogs import CatalogLoader

try:
    import openpyxl
except ImportError:
    openpyxl = None

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

# --- Database Setup ---

# DB path is configurable so the container can point it at a dedicated data
# volume (/data/wapsell.db) — keeps the SQLite file persistent across rebuilds
# without a volume shadowing the app code. Defaults to local file for dev.
DB_PATH = os.getenv("WAPSELL_DB_PATH", os.path.join(os.path.dirname(__file__), "wapsell.db"))

# Environment flags. In production set WAPSELL_ENV=production (enables Secure
# cookies and hides the dev-only verify_url fallback).
WAPSELL_ENV = os.getenv("WAPSELL_ENV", "production")
IS_PROD = WAPSELL_ENV == "production"
COOKIE_SECURE = os.getenv("WAPSELL_COOKIE_SECURE", "true" if IS_PROD else "false") == "true"

def seed_properties(cursor):
    """Seed database with 10 demo properties."""
    now = datetime.now(UTC).isoformat()
    properties = [
        ("prop_001", "Departamento 2 amb Palermo Soho", "Luminoso con balcón, piso alto", "compra", 85000, 2, 1, "Palermo", "Borges 1650, CABA", 65),
        ("prop_002", "PH 3 amb San Telmo", "Con patio y cochera", "compra", 120000, 3, 2, "San Telmo", "Defensa 2100, CABA", 120),
        ("prop_003", "Monoambiente Recoleta", "Moderno y equipado, apto crédito", "compra", 72000, 1, 1, "Recoleta", "Av. Santa Fe 1200, CABA", 45),
        ("prop_004", "Departamento 2 amb Caballito", "Reciclado, zona tranquila", "alquiler", 1200, 2, 1, "Caballito", "Avenida Rivadavia 3000, CABA", 70),
        ("prop_005", "Casa 4 amb Villa Urquiza", "Garaje doble, parque", "compra", 280000, 4, 3, "Villa Urquiza", "Virrey Ceballos 4500, CABA", 250),
        ("prop_006", "Monoambiente Microcentro", "Apto estudiantes, ejecutivos", "alquiler", 900, 1, 1, "Microcentro", "Tucumán 800, CABA", 38),
        ("prop_007", "Departamento 3 amb Belgrano", "Amenities: piscina, gym", "alquiler", 1800, 3, 2, "Belgrano", "Av. Cabildo 2500, CABA", 110),
        ("prop_008", "PH 2 amb La Boca", "Histórico, excelente inversión", "compra", 95000, 2, 1, "La Boca", "Caminito 250, CABA", 60),
        ("prop_009", "Loft Balvanera", "Doble altura, industrial chic", "compra", 110000, 2, 2, "Balvanera", "Av. Corrientes 3000, CABA", 85),
        ("prop_010", "Departamento 1 amb Villa Crespo", "Renovado, cuadra silenciosa", "alquiler", 800, 1, 1, "Villa Crespo", "Gallo 1400, CABA", 40),
    ]

    for prop_id, title, desc, prop_type, price, beds, baths, location, address, area in properties:
        cursor.execute("""
            INSERT INTO properties (id, title, description, type, price, bedrooms, bathrooms, location, address, area, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (prop_id, title, desc, prop_type, price, beds, baths, location, address, area, now))

def init_db():
    """Initialize SQLite database with all tables."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    # Sessions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # Properties table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS properties (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            type TEXT NOT NULL,
            price REAL,
            bedrooms INTEGER,
            bathrooms INTEGER,
            location TEXT,
            address TEXT,
            area REAL,
            created_at TEXT NOT NULL
        )
    """)

    # Chat messages table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # Leads table — the demo funnel identity. A visitor gets an anonymous lead
    # on first message; once they leave contact info, status flips to 'captured'.
    # Persona + message_count are persisted here for the sales team.
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS leads (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT,
            phone TEXT,
            company TEXT,
            status TEXT NOT NULL DEFAULT 'anonymous',
            detected_persona TEXT,
            persona_confidence REAL DEFAULT 0.0,
            message_count INTEGER DEFAULT 0,
            source TEXT,
            created_at TEXT NOT NULL,
            captured_at TEXT,
            last_active TEXT
        )
    """)

    # ---------------------------------------------------------------------
    # TWO-LAYER DATA ARCHITECTURE
    #   Capa 1 (demo, sin login): `leads`, `chat_messages`, `buyer_profiles`.
    #   Capa 2 (app, con login):  `app_users`, `app_accounts`,
    #                             `app_subscriptions`, `app_messages`.
    # The two layers NEVER share tables. They are related ONLY through the
    # `conversions` bridge (and, softly, by matching email/phone). This keeps
    # them fully decoupled and trivial to split into two databases later.
    # ---------------------------------------------------------------------

    # Capa 2 — registered accounts (built out when the WhatsApp chip arrives).
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS app_users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            name TEXT,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS app_accounts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            business_name TEXT,
            plan TEXT DEFAULT 'starter',
            status TEXT DEFAULT 'trial',
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES app_users(id)
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS app_subscriptions (
            id TEXT PRIMARY KEY,
            account_id TEXT NOT NULL,
            plan TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            started_at TEXT NOT NULL,
            renews_at TEXT,
            FOREIGN KEY (account_id) REFERENCES app_accounts(id)
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS app_messages (
            id TEXT PRIMARY KEY,
            account_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (account_id) REFERENCES app_accounts(id)
        )
    """)

    # Deals (Capa 2) — a pre-deal (lead) becomes a DEAL once its email/phone is
    # validated. Structured, pipeline-staged. Never shares tables with Capa 1.
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS app_deals (
            id TEXT PRIMARY KEY,
            lead_id TEXT,
            name TEXT,
            email TEXT,
            phone TEXT,
            company TEXT,
            stage TEXT DEFAULT 'new',
            persona TEXT,
            source TEXT,
            created_at TEXT NOT NULL,
            validated_at TEXT
        )
    """)

    # Bridge — the ONLY place a demo lead and its Capa-2 entity (deal/user) meet.
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversions (
            id TEXT PRIMARY KEY,
            demo_lead_id TEXT NOT NULL,
            app_deal_id TEXT,
            app_user_id TEXT,
            matched_by TEXT,
            created_at TEXT NOT NULL
        )
    """)

    # --- lightweight migrations (add columns if missing on existing DBs) ---
    def _add_col(table, col, ddl):
        try:
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {ddl}")
        except sqlite3.OperationalError:
            pass  # column already exists
    _add_col("leads", "verify_token", "TEXT")
    _add_col("leads", "email_verified", "INTEGER DEFAULT 0")
    _add_col("leads", "verified_at", "TEXT")
    _add_col("conversions", "app_deal_id", "TEXT")

    conn.commit()

    # Seed default properties if table is empty
    cursor.execute("SELECT COUNT(*) FROM properties")
    if cursor.fetchone()[0] == 0:
        seed_properties(cursor)

    init_ml_tables(conn)

    conn.commit()
    conn.close()

def get_db():
    """Get a SQLite connection hardened for concurrency.

    WAL + busy_timeout let concurrent readers/writers coexist instead of
    failing with 'database is locked'. (We deliberately do NOT enable
    PRAGMA foreign_keys: chat_messages.user_id holds demo-lead ids that are
    not in `users`, so enforcing FKs would reject demo inserts.)
    """
    conn = sqlite3.connect(DB_PATH, timeout=10)
    try:
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA busy_timeout=5000")
    except sqlite3.OperationalError:
        pass
    return conn

# --- Email (Resend) ---
# Activates automatically once RESEND_API_KEY is set in the env. Until then,
# /demo/contact returns the verify_url so the flow is testable end-to-end.
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
RESEND_FROM = os.getenv("RESEND_FROM", "Wapsell <onboarding@resend.dev>")
PUBLIC_API_URL = os.getenv("WAPSELL_PUBLIC_API_URL", "https://api.wapsell.com")

def send_verification_email(to_email: str, verify_url: str, lang: str = "es") -> bool:
    """Send the email-verification link via Resend. Returns True on success."""
    if not RESEND_API_KEY:
        logging.warning("[EMAIL] RESEND_API_KEY not set; skipping send to %s", to_email)
        return False
    if lang == "en":
        subject = "Verify your email · Wapsell"
        html = (
            f"<div style='font-family:sans-serif;max-width:480px;margin:auto'>"
            f"<h2>One last step ✅</h2>"
            f"<p>Confirm your email to activate your Wapsell quote and we'll reach "
            f"out on WhatsApp.</p>"
            f"<p><a href='{verify_url}' style='background:#25D366;color:#fff;"
            f"padding:12px 20px;border-radius:8px;text-decoration:none;"
            f"display:inline-block'>Verify my email</a></p>"
            f"<p style='color:#888;font-size:12px'>If the button doesn't work: {verify_url}</p>"
            f"</div>"
        )
    else:
        subject = "Verificá tu email · Wapsell"
        html = (
            f"<div style='font-family:sans-serif;max-width:480px;margin:auto'>"
            f"<h2>Un último paso ✅</h2>"
            f"<p>Confirmá tu email para activar tu cotización de Wapsell y te "
            f"contactamos por WhatsApp.</p>"
            f"<p><a href='{verify_url}' style='background:#25D366;color:#fff;"
            f"padding:12px 20px;border-radius:8px;text-decoration:none;"
            f"display:inline-block'>Verificar mi email</a></p>"
            f"<p style='color:#888;font-size:12px'>Si el botón no funciona: {verify_url}</p>"
            f"</div>"
        )
    payload = json.dumps({
        "from": RESEND_FROM, "to": [to_email], "subject": subject, "html": html,
    }).encode()
    req = urllib.request.Request(
        "https://api.resend.com/emails", data=payload, method="POST",
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
            # Cloudflare (in front of Resend) blocks the default Python-urllib
            # User-Agent with a 403/1010. A real UA gets through.
            "User-Agent": "wapsell/1.0 (+https://wapsell.com)",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            ok = r.status in (200, 201)
            logging.info("[EMAIL] verification sent to %s (status %s)", to_email, r.status)
            return ok
    except Exception as e:
        logging.error("[EMAIL] send failed for %s: %s", to_email, e)
        return False

# --- Models ---

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if len(v) < 2:
            raise ValueError('Name must be at least 2 characters')
        if len(v) > 100:
            raise ValueError('Name must be less than 100 characters')
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    created_at: str

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    persona: Optional[str] = None
    should_capture: bool = False

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None

class DemoSessionOut(BaseModel):
    demo_id: str

class QuoteRequest(BaseModel):
    plan: Optional[str] = None
    conversations: Optional[int] = None
    lang: str = "es"

class PropertyOut(BaseModel):
    id: str
    title: str
    description: str
    type: str
    price: float
    bedrooms: int
    bathrooms: int
    location: str
    address: str
    area: float

class ChatMessageOut(BaseModel):
    id: str
    role: str
    content: str
    created_at: str

# --- Auth Utils ---

_PBKDF2_ROUNDS = 240000

def hash_password(password: str) -> str:
    """Salted PBKDF2-HMAC-SHA256 (stdlib, no extra deps).

    Format: 'pbkdf2$<rounds>$<salt_hex>$<hash_hex>'.
    """
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _PBKDF2_ROUNDS)
    return f"pbkdf2${_PBKDF2_ROUNDS}${salt.hex()}${dk.hex()}"

def verify_password(password: str, password_hash: str) -> bool:
    """Verify against PBKDF2 hashes; still accepts legacy SHA-256 (so old
    accounts keep working — re-hash them on next login via needs_rehash)."""
    try:
        if password_hash.startswith("pbkdf2$"):
            _, rounds, salt_hex, expected = password_hash.split("$")
            dk = hashlib.pbkdf2_hmac("sha256", password.encode(),
                                     bytes.fromhex(salt_hex), int(rounds))
            return secrets.compare_digest(dk.hex(), expected)
        # Legacy: unsalted SHA-256
        return secrets.compare_digest(
            hashlib.sha256(password.encode()).hexdigest(), password_hash)
    except Exception:
        return False

def needs_rehash(password_hash: str) -> bool:
    """True for legacy hashes that should be upgraded to PBKDF2 on login."""
    return not password_hash.startswith("pbkdf2$")

def generate_session_token() -> str:
    """Generate secure session token."""
    return secrets.token_urlsafe(32)

def create_session(user_id: str) -> tuple[str, str]:
    """Create a session and return (token, expires_at_iso)."""
    token = generate_session_token()
    expires_at = datetime.now(UTC) + timedelta(days=7)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
        (token, user_id, expires_at.isoformat())
    )
    conn.commit()
    conn.close()

    return token, expires_at.isoformat()

def verify_session(token: str) -> Optional[str]:
    """Verify session token and return user_id if valid."""
    if not token:
        return None

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT user_id, expires_at FROM sessions WHERE token = ?",
        (token,)
    )
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    user_id, expires_at_iso = row
    expires_at = datetime.fromisoformat(expires_at_iso)

    if datetime.now(UTC) > expires_at:
        return None

    return user_id

def get_user_by_id(user_id: str) -> Optional[tuple]:
    """Get user by ID."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, email, created_at FROM users WHERE id = ?",
        (user_id,)
    )
    user = cursor.fetchone()
    conn.close()
    return user

# --- Lead (demo funnel) Utils ---

def create_lead(source: str = "demo") -> str:
    """Create an anonymous lead and return its id (used as the demo identity)."""
    lead_id = secrets.token_urlsafe(16)
    now = datetime.now(UTC).isoformat()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO leads (id, status, source, created_at, last_active)
           VALUES (?, 'anonymous', ?, ?, ?)""",
        (lead_id, source, now, now),
    )
    conn.commit()
    conn.close()
    return lead_id

def get_lead(lead_id: str) -> Optional[dict]:
    """Return a lead row as a dict, or None."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT id, name, email, phone, company, status, detected_persona,
                  persona_confidence, message_count, source, created_at,
                  captured_at, last_active
           FROM leads WHERE id = ?""",
        (lead_id,),
    )
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    cols = ["id", "name", "email", "phone", "company", "status",
            "detected_persona", "persona_confidence", "message_count",
            "source", "created_at", "captured_at", "last_active"]
    return dict(zip(cols, row))

def touch_lead(lead_id: str, persona: str = None, confidence: float = None) -> Optional[dict]:
    """Bump a lead's message_count / last_active (and persona) on each message.

    Returns the updated lead dict (or None if it isn't a lead).
    """
    lead = get_lead(lead_id)
    if not lead:
        return None
    now = datetime.now(UTC).isoformat()
    new_count = (lead["message_count"] or 0) + 1
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """UPDATE leads
           SET message_count = ?, last_active = ?,
               detected_persona = COALESCE(?, detected_persona),
               persona_confidence = COALESCE(?, persona_confidence)
           WHERE id = ?""",
        (new_count, now, persona, confidence, lead_id),
    )
    conn.commit()
    conn.close()
    lead["message_count"] = new_count
    if persona is not None:
        lead["detected_persona"] = persona
    if confidence is not None:
        lead["persona_confidence"] = confidence
    return lead

def capture_lead(lead_id: str, name: str, email: str, phone: str, company: str) -> Optional[dict]:
    """Attach contact info to a lead and flip status to 'captured'."""
    lead = get_lead(lead_id)
    if not lead:
        return None
    now = datetime.now(UTC).isoformat()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """UPDATE leads
           SET name = ?, email = ?, phone = ?, company = ?,
               status = 'captured',
               captured_at = COALESCE(captured_at, ?),
               last_active = ?
           WHERE id = ?""",
        (name, email, phone, company, now, now, lead_id),
    )
    conn.commit()
    conn.close()
    return get_lead(lead_id)

def get_identity(identity_id: str) -> bool:
    """True if the id belongs to a real user OR a demo lead."""
    if get_user_by_id(identity_id):
        return True
    return get_lead(identity_id) is not None

def link_conversion(app_user_id: str, email: str = "", phone: str = "") -> Optional[dict]:
    """Bridge a demo lead to an app user when the contact matches.

    The ONLY place the two layers are related. Called on app registration
    (Capa 2). Matches a captured demo lead by email or phone, then records a
    row in `conversions`. Returns the bridge row, or None if no demo lead.
    """
    conn = get_db()
    cursor = conn.cursor()
    lead_row = None
    matched_by = None
    if email:
        cursor.execute("SELECT id FROM leads WHERE email = ? ORDER BY captured_at DESC LIMIT 1", (email,))
        lead_row = cursor.fetchone()
        matched_by = "email" if lead_row else None
    if not lead_row and phone:
        cursor.execute("SELECT id FROM leads WHERE phone = ? ORDER BY captured_at DESC LIMIT 1", (phone,))
        lead_row = cursor.fetchone()
        matched_by = "phone" if lead_row else None
    if not lead_row:
        conn.close()
        return None
    bridge = {
        "id": secrets.token_urlsafe(12),
        "demo_lead_id": lead_row[0],
        "app_user_id": app_user_id,
        "matched_by": matched_by,
        "created_at": datetime.now(UTC).isoformat(),
    }
    cursor.execute(
        """INSERT INTO conversions (id, demo_lead_id, app_user_id, matched_by, created_at)
           VALUES (?, ?, ?, ?, ?)""",
        (bridge["id"], bridge["demo_lead_id"], bridge["app_user_id"],
         bridge["matched_by"], bridge["created_at"]),
    )
    conn.commit()
    conn.close()
    return bridge

def get_deal(deal_id: str) -> Optional[dict]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT id, lead_id, name, email, phone, company, stage, persona,
                  source, created_at, validated_at
           FROM app_deals WHERE id = ?""",
        (deal_id,),
    )
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    cols = ["id", "lead_id", "name", "email", "phone", "company", "stage",
            "persona", "source", "created_at", "validated_at"]
    return dict(zip(cols, row))

def set_verify_token(lead_id: str, token: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE leads SET verify_token = ?, email_verified = 0 WHERE id = ?",
        (token, lead_id),
    )
    conn.commit()
    conn.close()

def promote_lead_to_deal(lead_id: str) -> Optional[dict]:
    """Promote a validated pre-deal (lead) to a DEAL in Capa 2 + write the bridge.

    Idempotent: a lead already promoted returns its existing deal.
    """
    lead = get_lead(lead_id)
    if not lead:
        return None
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM app_deals WHERE lead_id = ?", (lead_id,))
    existing = cursor.fetchone()
    if existing:
        conn.close()
        return get_deal(existing[0])

    deal_id = secrets.token_urlsafe(12)
    now = datetime.now(UTC).isoformat()
    cursor.execute(
        """INSERT INTO app_deals
           (id, lead_id, name, email, phone, company, stage, persona, source, created_at, validated_at)
           VALUES (?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, ?)""",
        (deal_id, lead_id, lead.get("name"), lead.get("email"), lead.get("phone"),
         lead.get("company"), lead.get("detected_persona"), lead.get("source"), now, now),
    )
    # Bridge row: the ONLY link between Capa 1 (lead) and Capa 2 (deal).
    cursor.execute(
        """INSERT INTO conversions (id, demo_lead_id, app_deal_id, app_user_id, matched_by, created_at)
           VALUES (?, ?, ?, ?, 'email', ?)""",
        (secrets.token_urlsafe(12), lead_id, deal_id, "", now),
    )
    conn.commit()
    conn.close()
    logging.info("[DEAL] promoted lead %s -> deal %s", lead_id, deal_id)
    return get_deal(deal_id)

# --- Chat & Properties Utils ---

def search_properties(query: str, limit: int = 5) -> list:
    """Search properties by keyword, matching title/location words (fuzzy-friendly)."""
    conn = get_db()
    cursor = conn.cursor()

    # Extract keywords (2+ chars, drop stopwords)
    _STOP = {
        "lo", "la", "un", "el", "es", "de", "en", "o", "y", "a", "por", "que", "con",
        "del", "para", "como", "cual", "este", "eso", "tiene", "hay", "the", "and",
        "for", "with", "what", "una", "mas", "muy", "info", "sobre", "es", "al",
    }
    keywords = [
        w.lower() for w in query.split()
        if len(w) >= 2 and w.lower() not in _STOP
    ]

    # Match by word prefix (so "depto" matches "Departamento", "pal" matches "Palermo")
    results = []
    if keywords:
        cursor.execute(f"SELECT id, title, description, type, price, bedrooms, location FROM properties")
        all_props = cursor.fetchall()

        for kw in keywords:
            for prop in all_props:
                # Check if keyword is a prefix of any word in title/location
                title_words = prop[1].lower().split()
                location_words = prop[6].lower().split()
                all_words = title_words + location_words

                if any(w.startswith(kw) for w in all_words):
                    if prop not in results:
                        results.append(prop)
                    if len(results) >= limit:
                        break
            if len(results) >= limit:
                break

    # Trim to limit
    seen = set()
    unique_results = []
    for r in results:
        if r[0] not in seen:
            seen.add(r[0])
            unique_results.append(r)
            if len(unique_results) >= limit:
                break

    results = unique_results

    # NOTE: no random fallback. If nothing matches we return [] so the chat
    # can reply conversationally (a greeting / clarifying question) instead of
    # dumping unrelated properties for messages like "hola" or "¿cómo estás?".

    conn.close()
    print(f"[SEARCH] returning {len(results)} results")  # Debug
    return results

# Greeting / small-talk detection so the bot answers conversationally instead
# of dumping properties. Kept deliberately simple and fast (no LLM call).
_GREETING_HINTS = (
    "hola", "holaa", "ola", "buenas", "buen dia", "buen día", "buenos dias",
    "buenos días", "buenas tardes", "buenas noches", "hey", "ey", "hi", "hello",
    "que tal", "qué tal", "como estas", "cómo estás", "como andas", "cómo andás",
    "como va", "cómo va", "todo bien", "que hacés", "qué hacés", "gracias",
    "saludos", "buen finde",
)

def is_smalltalk(message: str) -> bool:
    """True for short greetings / small-talk with no property-search intent."""
    m = message.strip().lower()
    if len(m) > 40:
        return False
    return any(h in m for h in _GREETING_HINTS)

def greeting_reply(lang: str = "es") -> str:
    """Warm, sales-oriented opener that nudges the visitor to share criteria."""
    if lang == "en":
        return (
            "Hi! 👋 Great to have you here. I help you find your next property in "
            "Buenos Aires.\n\nTell me what you're after — area, budget and how many "
            "rooms — and I'll show you the best options right away. 🏡"
        )
    return (
        "¡Hola! 👋 Un gusto tenerte por acá. Te ayudo a encontrar tu próxima "
        "propiedad en Buenos Aires.\n\nContame qué estás buscando — zona, "
        "presupuesto y cuántos ambientes — y te muestro las mejores opciones al "
        "instante. 🏡"
    )

def save_chat_message(user_id: str, role: str, content: str) -> str:
    """Save a chat message to database."""
    msg_id = secrets.token_urlsafe(12)
    now = datetime.now(UTC).isoformat()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO chat_messages (id, user_id, role, content, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (msg_id, user_id, role, content, now))
    conn.commit()
    conn.close()
    return msg_id

def get_chat_history(user_id: str) -> list:
    """Get chat history for a user."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, role, content, created_at
        FROM chat_messages
        WHERE user_id = ?
        ORDER BY created_at ASC
    """, (user_id,))
    messages = cursor.fetchall()
    conn.close()
    return messages

def normalize_row(row: dict) -> dict:
    """Normalize row keys to lowercase and handle variations."""
    normalized = {}
    key_map = {
        'title': ['title', 'nombre', 'name', 'propiedad'],
        'type': ['type', 'tipo', 'categoria'],
        'location': ['location', 'ubicacion', 'barrio', 'zona'],
        'description': ['description', 'descripcion', 'detalle'],
        'price': ['price', 'precio', 'valor'],
        'bedrooms': ['bedrooms', 'dormitorios', 'dorm', 'habitaciones'],
        'bathrooms': ['bathrooms', 'banos', 'baños'],
        'address': ['address', 'direccion', 'calle'],
        'area': ['area', 'superficie', 'm2', 'metros'],
    }

    for standard_key, aliases in key_map.items():
        for row_key, row_val in row.items():
            if row_key.lower() in aliases or row_key.lower() in [a.lower() for a in aliases]:
                normalized[standard_key] = row_val
                break

    return normalized

def parse_csv(file_path: str) -> list:
    """Parse CSV file and extract property data."""
    properties = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                normalized = normalize_row(row)
                if all(k in normalized for k in ['title', 'type', 'location']):
                    prop_id = secrets.token_urlsafe(8)
                    properties.append({
                        'id': prop_id,
                        'title': str(normalized.get('title', '')),
                        'description': str(normalized.get('description', '')),
                        'type': str(normalized.get('type', '')),
                        'price': float(normalized.get('price', 0)) if normalized.get('price') else 0,
                        'bedrooms': int(normalized.get('bedrooms', 1)) if normalized.get('bedrooms') else 1,
                        'bathrooms': int(normalized.get('bathrooms', 1)) if normalized.get('bathrooms') else 1,
                        'location': str(normalized.get('location', '')),
                        'address': str(normalized.get('address', '')),
                        'area': float(normalized.get('area', 0)) if normalized.get('area') else 0,
                    })
    except Exception as e:
        logging.error(f"CSV parsing error: {str(e)}")
    return properties

def parse_excel(file_path: str) -> list:
    """Parse Excel file and extract property data."""
    properties = []
    if not openpyxl:
        return properties
    try:
        wb = openpyxl.load_workbook(file_path, data_only=True)
        ws = wb.active
        headers = [cell.value for cell in ws[1]]
        for row in ws.iter_rows(min_row=2, values_only=True):
            if len(row) > 0 and row[0]:
                data = dict(zip(headers, row))
                normalized = normalize_row(data)
                if all(k in normalized for k in ['title', 'type', 'location']):
                    prop_id = secrets.token_urlsafe(8)
                    properties.append({
                        'id': prop_id,
                        'title': str(normalized.get('title', '')),
                        'description': str(normalized.get('description', '')),
                        'type': str(normalized.get('type', '')),
                        'price': float(normalized.get('price', 0)) if normalized.get('price') else 0,
                        'bedrooms': int(normalized.get('bedrooms', 1)) if normalized.get('bedrooms') else 1,
                        'bathrooms': int(normalized.get('bathrooms', 1)) if normalized.get('bathrooms') else 1,
                        'location': str(normalized.get('location', '')),
                        'address': str(normalized.get('address', '')),
                        'area': float(normalized.get('area', 0)) if normalized.get('area') else 0,
                    })
        wb.close()
    except Exception as e:
        logging.error(f"Excel parsing error: {str(e)}")
    return properties

def parse_pdf(file_path: str) -> list:
    """Parse PDF file and extract property data (basic text extraction)."""
    properties = []
    if not pdfplumber:
        return properties
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                # Simple extraction - in production, use better parsing
                if text:
                    logging.info(f"PDF page extracted: {len(text)} chars")
    except Exception as e:
        logging.error(f"PDF parsing error: {str(e)}")
    return properties

def insert_properties(properties: list, user_id: str = None) -> int:
    """Insert properties into database."""
    if not properties:
        return 0
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now(UTC).isoformat()
    count = 0
    for prop in properties:
        try:
            cursor.execute("""
                INSERT INTO properties (id, title, description, type, price, bedrooms, bathrooms, location, address, area, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (prop['id'], prop['title'], prop['description'], prop['type'], prop['price'],
                  prop['bedrooms'], prop['bathrooms'], prop['location'], prop['address'], prop['area'], now))
            count += 1
        except sqlite3.IntegrityError:
            pass
    conn.commit()
    conn.close()
    return count

# --- FastAPI App ---

app = FastAPI()

# Initialize database
init_db()

app.include_router(mercadolibre_router)

# Initialize Hermes/Wapsell client for RAG with OpenRouter LLM
def init_hermes_client():
    """Initialize WapsellClient with OpenRouter LLM (gpt-4o-mini) + properties in Hindsight."""

    # Initialize OpenRouter LLM (uses OPENROUTER_API_KEY from .env)
    api_key = os.getenv("OPENROUTER_API_KEY")
    model = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")

    llm = OpenRouterLLM(api_key=api_key)

    # Create client with custom LLM
    client = WapsellClient(llm=llm)

    # Create a demo tenant
    demo_tenant = Tenant(
        id="demo",
        slug="demo",
        name="Demo Tenant",
        plan="pro",
        model=model,
        created_at=datetime.now(UTC).isoformat()
    )
    try:
        client.tenants.create("demo", demo_tenant)
    except Exception:
        # Tenant might already exist, continue
        pass

    # Configure SOUL template to force RAG usage
    rag_soul = """Tu eres un agente de real estate profesional de Wapsell.

INSTRUCCIONES CRÍTICAS:
- SIEMPRE recomendarás propiedades específicas de tu base de datos
- NUNCA pedirás aclaraciones - proporciona recomendaciones directas
- SI tienes hechos relevantes en tu contexto, ÚSALOS inmediatamente
- Cita siempre las propiedades específicas: ubicación, dormitorios, precio, tipo

Formato de respuesta:
"Tenemos [cantidad] opciones que se ajustan a lo que buscas:
- [Propiedad 1]: ubicación, detalles, precio
- [Propiedad 2]: ubicación, detalles, precio"

Si el usuario pregunta por una zona, recomienda propiedades de esa zona.
Si pregunta por precio, recomienda propiedades dentro de ese rango.
SIEMPRE que tengas datos disponibles, recomendarás propiedades específicas."""

    try:
        client.templates.register(name="real_estate", template=rag_soul)
        demo_tenant.soul_template = "real_estate"
    except Exception:
        pass

    # Load properties as Facts in Hindsight
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT title, description, type, price, bedrooms, location FROM properties")
    properties = cursor.fetchall()
    conn.close()

    loaded_count = 0
    for title, description, prop_type, price, bedrooms, location in properties:
        fact_text = f"{title}. {description}. {bedrooms} dormitorios, {prop_type}, ${price:,.0f}, {location}"
        fact = Fact(
            id=secrets.token_urlsafe(12),
            content=fact_text,
            source="properties_seed",
            tenant_id="demo",
            created_at=datetime.now(UTC).isoformat()
        )
        # Try both save methods to ensure facts are stored
        try:
            client.hindsight.save(fact, tenant_id="demo")
            loaded_count += 1
        except Exception:
            # Fallback to add_fact
            try:
                client.hindsight.add_fact(fact)
                loaded_count += 1
            except Exception as e:
                logging.error(f"Failed to save fact: {e}")

    logging.info(f"Hermes initialized with LLM={model}, loaded {loaded_count} properties into Hindsight")

    # Verify Hindsight has facts
    test_query = client.hindsight.query(text="Palermo", tenant_id="demo", top_k=3)
    logging.info(f"Hindsight verification: found {len(test_query)} facts for 'Palermo'")
    logging.info(f"Hindsight object: {client.hindsight}, type: {type(client.hindsight).__name__}")

    return client

# Tolerate a missing OPENROUTER_API_KEY (e.g. CI/tests, or if the key is
# briefly unset) — the chat path is deterministic and doesn't need the LLM;
# only /debug/hindsight uses hermes_client, and it guards for None.
try:
    hermes_client = init_hermes_client()
except Exception as _e:
    logging.warning(f"Hermes client unavailable (continuing without LLM): {_e}")
    hermes_client = None

# Initialize Buyer Profile Manager for adaptive personas and learning
buyer_profile_manager = BuyerProfileManager(db_path=DB_PATH)

# CORS middleware. The demo uses lead-based identity (user_id as query param),
# NOT cookies — so we don't need credentialed CORS, and we can list explicit
# origins. (allow_origins=["*"] + allow_credentials=True is rejected by browsers.)
CORS_ORIGINS = os.getenv(
    "WAPSELL_CORS_ORIGINS",
    "https://wapsell.com,https://www.wapsell.com,http://localhost:3000",
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS_ORIGINS if o.strip()],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Lightweight in-memory rate limiting (per IP, sliding window) ---
# Protects public endpoints that cost money or can be abused (email, LLM).
# In-process only (fine for a single uvicorn worker); for multi-worker use a
# shared store (Redis) or nginx limit_req.
from collections import deque

_rate_buckets: dict[str, deque] = {}

def _client_ip(request: Request) -> str:
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

def rate_limit(request: Request, key: str, limit: int, window_s: int):
    """Allow `limit` requests per `window_s` seconds per IP, else HTTP 429."""
    ip = _client_ip(request)
    bucket = _rate_buckets.setdefault(f"{key}:{ip}", deque())
    now = time.time()
    while bucket and bucket[0] <= now - window_s:
        bucket.popleft()
    if len(bucket) >= limit:
        raise HTTPException(status_code=429, detail="Demasiadas solicitudes. Probá en un momento.")
    bucket.append(now)

# --- Endpoints ---

@app.post("/auth/register", response_model=UserOut, status_code=201)
async def register(req: RegisterRequest, response: Response):
    """Register a new user with validation."""
    try:
        # Hash password
        password_hash = hash_password(req.password)

        # Generate user ID
        user_id = secrets.token_urlsafe(16)

        # Insert user
        conn = get_db()
        cursor = conn.cursor()
        now = datetime.now(UTC).isoformat()
        cursor.execute(
            "INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
            (user_id, req.email, password_hash, now)
        )
        conn.commit()
        conn.close()

        # Create session
        token, expires_at = create_session(user_id)

        # Set HTTP-only session cookie
        response.set_cookie(
            key="wapsell_session",
            value=token,
            httponly=True,
            secure=COOKIE_SECURE,  # True in prod (HTTPS) via WAPSELL_ENV
            samesite="lax",
            expires=expires_at,
            path="/",
        )

        return UserOut(id=user_id, email=req.email, created_at=now)

    except sqlite3.IntegrityError as exc:
        if "UNIQUE constraint failed" in str(exc):
            raise HTTPException(status_code=409, detail="Este email ya está registrado")
        raise HTTPException(status_code=400, detail="Error al registrar usuario")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logging.error(f"Registration error: {str(exc)}")
        raise HTTPException(status_code=500, detail="Error al registrar usuario")

@app.post("/auth/login", response_model=UserOut)
async def login(req: LoginRequest, response: Response):
    """Log in a user with validation."""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, email, password_hash, created_at FROM users WHERE email = ?",
            (req.email,)
        )
        user_row = cursor.fetchone()
        conn.close()

        if not user_row or not verify_password(req.password, user_row[2]):
            raise HTTPException(status_code=401, detail="Email o contraseña inválidos")

        user_id = user_row[0]

        # Upgrade legacy SHA-256 hashes to PBKDF2 on successful login.
        if needs_rehash(user_row[2]):
            c2 = get_db(); cur2 = c2.cursor()
            cur2.execute("UPDATE users SET password_hash = ? WHERE id = ?",
                         (hash_password(req.password), user_id))
            c2.commit(); c2.close()

        # Create session
        token, expires_at = create_session(user_id)

        # Set HTTP-only session cookie
        response.set_cookie(
            key="wapsell_session",
            value=token,
            httponly=True,
            secure=COOKIE_SECURE,  # True in prod (HTTPS) via WAPSELL_ENV
            samesite="lax",
            expires=expires_at,
            path="/",
        )

        return UserOut(id=user_id, email=req.email, created_at=user_row[3])

    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logging.error(f"Login error: {str(exc)}")
        raise HTTPException(status_code=500, detail="Error al iniciar sesión")

@app.get("/auth/me", response_model=UserOut)
async def get_me(request: Request):
    """Get current user from session."""
    token = request.cookies.get("wapsell_session")
    user_id = verify_session(token)

    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return UserOut(id=user[0], email=user[1], created_at=user[2])

@app.post("/auth/logout", status_code=204)
async def logout(response: Response):
    """Log out the current user."""
    response.delete_cookie("wapsell_session", path="/")
    return Response(status_code=204)

# --- Chat Endpoints ---

@app.post("/chat/message", response_model=ChatResponse)
async def chat_message(request: Request, req: ChatRequest, user_id: str = None, lang: str = "es"):
    """Send a message and get adaptive persona-aware response with RAG."""
    rate_limit(request, "chat_message", limit=40, window_s=60)
    try:
        if not user_id:
            raise HTTPException(status_code=401, detail="user_id required")

        # Identity can be a registered user OR a demo lead.
        if not get_identity(user_id):
            raise HTTPException(status_code=401, detail="Unknown identity")

        # Save user message
        save_chat_message(user_id, "user", req.message)

        # STEP 1: Detect/update buyer persona
        buyer_id = f"demo:{user_id}"
        persona, confidence = buyer_profile_manager.get_or_detect_persona(user_id, req.message)
        logging.info(f"[PERSONA] User {user_id} -> {persona.value} (confidence: {confidence:.2f})")

        # --- Hybrid reply: the agent SELLS Wapsell, and shows a live property
        # example on request ("this is how I'd reply to YOUR customers"). ---
        try:
            msg = req.message
            if wapsell_sales.wants_example(msg):
                # Switch into the property showcase (the "demo within the demo").
                reply = wapsell_sales.example_intro(lang)
                logging.info("[RESPONSE] example intro")
                buyer_profile_manager.db.record_interaction(user_id, successful=True)
            else:
                intent = wapsell_sales.detect_intent(msg)  # pricing/how/why/contract/...
                properties = search_properties(msg, limit=5)
                if intent == "pricing" or wapsell_sales.is_quote_request(msg):
                    # Auto-quote if they mention a volume or a specific plan.
                    vol = wapsell_sales.detect_volume(msg)
                    plan = wapsell_sales.detect_plan(msg)
                    if vol is not None or plan:
                        _, reply = wapsell_sales.auto_quote(conversations=vol, plan=plan, lang=lang)
                        logging.info(f"[RESPONSE] auto-quote vol={vol} plan={plan}")
                    else:
                        reply = wapsell_sales.pricing_answer(lang)
                        logging.info("[RESPONSE] pricing table")
                    buyer_profile_manager.db.record_interaction(user_id, successful=True)
                elif intent:
                    # Core Wapsell sales answer (deterministic, correct prices).
                    reply = wapsell_sales.sales_reply(intent, lang)
                    logging.info(f"[RESPONSE] wapsell sales intent: {intent}")
                    buyer_profile_manager.db.record_interaction(user_id, successful=True)
                elif properties:
                    # Real-estate sample = "what your customers would experience".
                    reply = ResponseTemplateGenerator.format_property_list(
                        properties=properties, persona=persona, intro=True
                    )
                    reply += ResponseTemplateGenerator.format_followup(persona, len(properties))
                    logging.info("[RESPONSE] property example showcase")
                    buyer_profile_manager.db.record_interaction(user_id, successful=True)
                elif is_smalltalk(msg):
                    reply = wapsell_sales.greeting(lang)
                    logging.info("[RESPONSE] wapsell greeting")
                    buyer_profile_manager.db.record_interaction(user_id, successful=False)
                else:
                    reply = wapsell_sales.default_menu(lang)
                    logging.info("[RESPONSE] wapsell default menu")
                    buyer_profile_manager.db.record_interaction(user_id, successful=False)
        except Exception as e:
            logging.error(f"Reply error: {str(e)}", exc_info=True)
            reply = wapsell_sales.default_menu(lang)
            buyer_profile_manager.db.record_interaction(user_id, successful=False)

        # Save agent response
        save_chat_message(user_id, "agent", reply)

        # If this identity is a demo lead, persist persona + bump message_count.
        # Ask the UI to show the contact-capture card once the lead is warm
        # (3rd message) and still anonymous.
        should_capture = False
        lead = touch_lead(user_id, persona=persona.value, confidence=confidence)
        if lead is not None:
            should_capture = (
                lead.get("status") == "anonymous"
                and (lead.get("message_count") or 0) >= 3
            )

        # Log persona insights
        persona_stats = buyer_profile_manager.get_persona_stats(persona)
        if persona_stats.get("buyer_count", 0) > 0:
            logging.info(f"[PERSONA_STATS] {persona.value}: "
                        f"{persona_stats.get('conversion_rate', 0):.1%} conversion rate")

        return ChatResponse(reply=reply, persona=persona.value, should_capture=should_capture)

    except HTTPException:
        raise
    except Exception as exc:
        logging.error(f"Chat error: {str(exc)}")
        raise HTTPException(status_code=500, detail=str(exc))

@app.get("/messages")
async def get_messages(user_id: str = None):
    """Get chat history for a user."""
    try:
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id required")

        # Accept both registered users and demo leads.
        if not get_identity(user_id):
            raise HTTPException(status_code=401, detail="Unknown identity")

        messages = get_chat_history(user_id)
        return {
            "messages": [
                ChatMessageOut(id=m[0], role=m[1], content=m[2], created_at=m[3])
                for m in messages
            ]
        }

    except HTTPException:
        raise
    except Exception as exc:
        logging.error(f"Get messages error: {str(exc)}")
        raise HTTPException(status_code=500, detail=str(exc))

# --- Demo Funnel (Leads) Endpoints ---

ADMIN_TOKEN = os.getenv("WAPSELL_ADMIN_TOKEN", "")
ADMIN_EMAIL = os.getenv("WAPSELL_ADMIN_EMAIL", "")

def notify_admin_of_lead(lead: dict, action: str = "captured"):
    """Send admin an email notification when a lead is captured or verified.

    lead: dict with keys {id, name, email, phone, company, detected_persona}
    action: 'captured' or 'verified'
    """
    if not ADMIN_EMAIL or not RESEND_API_KEY:
        return False
    try:
        persona = lead.get("detected_persona", "Unknown")
        html = f"""
        <h2>🎯 Nuevo lead {action}!</h2>
        <p><strong>{lead.get('name', 'Sin nombre')}</strong></p>
        <ul>
            <li><strong>Email:</strong> {lead.get('email', '-')}</li>
            <li><strong>Teléfono:</strong> {lead.get('phone', '-')}</li>
            <li><strong>Empresa:</strong> {lead.get('company', '-')}</li>
            <li><strong>Persona detectada:</strong> {persona}</li>
        </ul>
        <p><a href="https://wapsell.com/ventas">📊 Ver en el panel</a></p>
        """
        req = urllib.request.Request(
            "https://api.resend.com/emails",
            method="POST",
            data=json.dumps({
                "from": RESEND_FROM,
                "to": ADMIN_EMAIL,
                "subject": f"[{action.upper()}] Lead: {lead.get('name', 'sin nombre')}",
                "html": html,
            }).encode(),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "User-Agent": "wapsell/1.0",
            }
        )
        urllib.request.urlopen(req, timeout=5)
        return True
    except Exception as e:
        logging.warning(f"[NOTIFY] failed to email admin: {str(e)}")
        return False

@app.post("/demo/session", response_model=DemoSessionOut, status_code=201)
async def demo_session(request: Request):
    """Create an anonymous lead for a new demo visitor. No login required."""
    rate_limit(request, "demo_session", limit=20, window_s=60)
    try:
        demo_id = create_lead(source="demo")
        logging.info(f"[LEAD] new anonymous session {demo_id}")
        return DemoSessionOut(demo_id=demo_id)
    except Exception as exc:
        logging.error(f"Demo session error: {str(exc)}")
        raise HTTPException(status_code=500, detail="Could not start demo session")

@app.post("/demo/contact")
async def demo_contact(request: Request, req: ContactRequest, demo_id: str = None, lang: str = "es"):
    """Capture a lead's contact + send the email-verification link.

    On verification (GET /demo/verify) the lead is promoted to a Capa-2 deal.
    """
    # Strict: this triggers an outbound email — cap hard to prevent abuse.
    rate_limit(request, "demo_contact", limit=6, window_s=3600)
    try:
        if not demo_id:
            raise HTTPException(status_code=400, detail="demo_id required")
        lead = capture_lead(
            demo_id,
            name=req.name,
            email=str(req.email),
            phone=req.phone or "",
            company=req.company or "",
        )
        if lead is None:
            raise HTTPException(status_code=404, detail="Lead not found")

        # Generate the verification token + send the email.
        token = secrets.token_urlsafe(24)
        set_verify_token(demo_id, token)
        verify_url = f"{PUBLIC_API_URL}/demo/verify?token={token}"
        sent = send_verification_email(str(req.email), verify_url, lang)
        # Don't log the email (PII). The lead id is enough to trace.
        logging.info(f"[LEAD] captured {demo_id} email_sent={sent}")

        # Notify admin of the captured lead
        notify_admin_of_lead(lead, action="captured")

        resp = {"status": "captured", "lead_id": demo_id, "email_sent": sent}
        # Dev-only fallback: expose the link for end-to-end testing without an
        # email provider. NEVER in production (would let anyone self-verify).
        if not sent and not IS_PROD:
            resp["verify_url"] = verify_url
        return resp
    except HTTPException:
        raise
    except Exception as exc:
        logging.error(f"Demo contact error: {str(exc)}")
        raise HTTPException(status_code=500, detail="Could not save contact")

@app.get("/demo/verify")
async def demo_verify(token: str = None):
    """Validate a lead's email and promote it to a Capa-2 deal. Clicked from email."""
    def page(title: str, body: str, ok: bool = True):
        color = "#25D366" if ok else "#e02424"
        html = (
            f"<!doctype html><html><head><meta charset='utf-8'>"
            f"<meta name='viewport' content='width=device-width,initial-scale=1'>"
            f"<title>{title}</title></head>"
            f"<body style='font-family:sans-serif;background:#efeae2;margin:0'>"
            f"<div style='max-width:460px;margin:12vh auto;background:#fff;border-radius:16px;"
            f"padding:32px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.08)'>"
            f"<div style='font-size:44px'>{'✅' if ok else '⚠️'}</div>"
            f"<h2 style='color:{color}'>{title}</h2><p style='color:#444'>{body}</p>"
            f"<a href='https://wapsell.com' style='color:#008069'>← wapsell.com</a>"
            f"</div></body></html>"
        )
        return Response(content=html, media_type="text/html",
                        status_code=200 if ok else 404)

    if not token:
        return page("Link inválido", "Falta el token de verificación.", ok=False)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM leads WHERE verify_token = ?", (token,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return page("Link inválido o vencido", "No encontramos esa verificación.", ok=False)
    lead_id = row[0]
    now = datetime.now(UTC).isoformat()
    cursor.execute(
        "UPDATE leads SET email_verified = 1, verified_at = ? WHERE id = ?",
        (now, lead_id),
    )
    cursor.execute(
        "SELECT name, email, phone, company, detected_persona FROM leads WHERE id = ?",
        (lead_id,)
    )
    lead_info = cursor.fetchone()
    conn.commit()
    conn.close()
    deal = promote_lead_to_deal(lead_id)
    logging.info(f"[VERIFY] lead {lead_id} verified -> deal {deal.get('id') if deal else None}")

    # Notify admin of the verified lead
    if lead_info:
        notify_admin_of_lead({
            "id": lead_id,
            "name": lead_info[0],
            "email": lead_info[1],
            "phone": lead_info[2],
            "company": lead_info[3],
            "detected_persona": lead_info[4],
        }, action="verified")

    return page(
        "¡Email verificado! 🎉",
        "Tu cotización quedó activa y te vamos a contactar por WhatsApp. ¡Gracias!",
    )

def _require_admin(token: Optional[str]):
    """Guard for sales-only endpoints. Set WAPSELL_ADMIN_TOKEN in the env."""
    if not ADMIN_TOKEN or token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Admin token required")

@app.get("/demo/leads")
async def list_leads(x_admin_token: Optional[str] = Header(None)):
    """List all leads + summary metrics. Sales-only (X-Admin-Token header)."""
    _require_admin(x_admin_token)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT id, name, email, phone, company, status, detected_persona,
                  persona_confidence, message_count, source, created_at,
                  captured_at, last_active
           FROM leads ORDER BY last_active DESC"""
    )
    cols = ["id", "name", "email", "phone", "company", "status",
            "detected_persona", "persona_confidence", "message_count",
            "source", "created_at", "captured_at", "last_active"]
    leads = [dict(zip(cols, row)) for row in cursor.fetchall()]
    conn.close()

    captured = [l for l in leads if l["status"] == "captured"]
    by_persona: dict = {}
    for l in leads:
        p = l.get("detected_persona") or "unknown"
        by_persona[p] = by_persona.get(p, 0) + 1

    return {
        "total": len(leads),
        "captured": len(captured),
        "anonymous": len(leads) - len(captured),
        "by_persona": by_persona,
        "leads": leads,
    }

@app.get("/demo/leads/{lead_id}/transcript")
async def lead_transcript(lead_id: str, x_admin_token: Optional[str] = Header(None)):
    """Full chat transcript for a lead. Sales-only (X-Admin-Token header)."""
    _require_admin(x_admin_token)
    lead = get_lead(lead_id)
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    messages = get_chat_history(lead_id)
    return {
        "lead": lead,
        "messages": [
            ChatMessageOut(id=m[0], role=m[1], content=m[2], created_at=m[3])
            for m in messages
        ],
    }

@app.get("/app/overview")
async def app_overview(x_admin_token: Optional[str] = Header(None)):
    """Snapshot of the two-layer architecture. Sales-only (X-Admin-Token)."""
    _require_admin(x_admin_token)
    conn = get_db()
    cursor = conn.cursor()

    def count(table: str) -> int:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            return cursor.fetchone()[0]
        except Exception:
            return 0

    overview = {
        "capa1_demo": {
            "leads": count("leads"),
            "messages": count("chat_messages"),
            "personas_tracked": count("buyer_profiles"),
        },
        "capa2_app": {
            "deals": count("app_deals"),
            "users": count("app_users"),
            "accounts": count("app_accounts"),
            "subscriptions": count("app_subscriptions"),
            "messages": count("app_messages"),
        },
        "bridge": {"conversions": count("conversions")},
        "note": "Las capas no comparten tablas; se relacionan solo via 'conversions'.",
    }
    conn.close()
    return overview

@app.get("/app/deals")
async def list_deals(x_admin_token: Optional[str] = Header(None)):
    """List Capa-2 deals (validated leads). Sales-only (X-Admin-Token)."""
    _require_admin(x_admin_token)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT id, lead_id, name, email, phone, company, stage, persona,
                  source, created_at, validated_at
           FROM app_deals ORDER BY created_at DESC"""
    )
    cols = ["id", "lead_id", "name", "email", "phone", "company", "stage",
            "persona", "source", "created_at", "validated_at"]
    deals = [dict(zip(cols, row)) for row in cursor.fetchall()]
    conn.close()
    return {"total": len(deals), "deals": deals}

# Pipeline stages a deal can move through.
DEAL_STAGES = ["new", "qualified", "negotiation", "won", "lost"]

@app.patch("/app/deals/{deal_id}")
async def update_deal(deal_id: str, stage: str = None,
                      x_admin_token: Optional[str] = Header(None)):
    """Move a deal through the pipeline. Sales-only (X-Admin-Token)."""
    _require_admin(x_admin_token)
    if stage not in DEAL_STAGES:
        raise HTTPException(status_code=400, detail=f"stage must be one of {DEAL_STAGES}")
    deal = get_deal(deal_id)
    if deal is None:
        raise HTTPException(status_code=404, detail="Deal not found")
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE app_deals SET stage = ? WHERE id = ?", (stage, deal_id))
    conn.commit()
    conn.close()
    logging.info(f"[DEAL] {deal_id} stage -> {stage}")
    return {"id": deal_id, "stage": stage}

# --- Pricing / Auto-quote Endpoints (public) ---

@app.get("/pricing")
async def get_pricing():
    """Public pricing table (single source of truth for auto-quoting)."""
    return {
        "plans": wapsell_sales.PLANS,
        "enterprise_tiers": wapsell_sales.ENTERPRISE_TIERS,
        "currency": ["ARS", "USD"],
    }

@app.post("/quote")
async def post_quote(request: Request, req: QuoteRequest):
    """Automatic quote from the table by plan and/or monthly conversations."""
    rate_limit(request, "quote", limit=30, window_s=60)
    data, text = wapsell_sales.auto_quote(
        conversations=req.conversations, plan=req.plan, lang=req.lang
    )
    return {"quote": data, "message": text}

# --- Persona Analytics Endpoints ---

@app.get("/analytics/persona/{user_id}")
async def get_buyer_persona(user_id: str):
    """Get detected persona and profile for a user."""
    try:
        profile = buyer_profile_manager.db.get_or_create(user_id)
        persona = PersonaType(profile.detected_persona)

        return {
            "user_id": user_id,
            "persona": profile.detected_persona,
            "confidence": profile.confidence_score,
            "interactions": profile.total_interactions,
            "conversions": profile.conversions,
            "conversion_rate": profile.conversions / max(profile.total_interactions, 1),
            "avg_satisfaction": profile.avg_satisfaction,
            "persona_summary": PersonaInsights.get_persona_summary(persona),
        }
    except Exception as exc:
        logging.error(f"Analytics error: {str(exc)}")
        raise HTTPException(status_code=500, detail=str(exc))

@app.get("/analytics/personas")
async def get_all_personas_stats():
    """Get aggregate statistics for all personas."""
    try:
        stats = {}
        best_persona = buyer_profile_manager.get_best_performing_persona()

        for persona_type in PersonaType:
            persona_stats = buyer_profile_manager.get_persona_stats(persona_type)
            stats[persona_type.value] = persona_stats

        return {
            "personas": stats,
            "best_performing": best_persona.value if best_persona else None,
            "total_profiles": sum(s.get("buyer_count", 0) for s in stats.values()),
        }
    except Exception as exc:
        logging.error(f"Analytics error: {str(exc)}")
        raise HTTPException(status_code=500, detail=str(exc))

@app.post("/properties/upload")
async def upload_properties(user_id: str = None, file: UploadFile = File(...)):
    """Upload property data from CSV, Excel, or PDF."""
    try:
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id required")

        user = get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        # Validate file type
        allowed_extensions = ['.csv', '.xlsx', '.xls', '.pdf']
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            raise HTTPException(status_code=400, detail=f"File type not allowed. Use: {', '.join(allowed_extensions)}")

        # Save file temporarily
        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
                content = await file.read()
                tmp.write(content)
                tmp_path = tmp.name

            # Parse based on file type
            properties = []
            if file_ext == '.csv':
                properties = parse_csv(tmp_path)
            elif file_ext in ['.xlsx', '.xls']:
                properties = parse_excel(tmp_path)
            elif file_ext == '.pdf':
                properties = parse_pdf(tmp_path)

            # Insert into database
            count = insert_properties(properties, user_id)

            return {
                "success": True,
                "message": f"Uploaded {count} properties",
                "count": count
            }
        finally:
            # Clean up temp file safely
            if tmp_path and os.path.exists(tmp_path):
                try:
                    import time
                    time.sleep(0.1)  # Small delay to ensure file is released
                    os.unlink(tmp_path)
                except Exception as e:
                    logging.warning(f"Could not delete temp file {tmp_path}: {str(e)}")

    except HTTPException:
        raise
    except Exception as exc:
        logging.error(f"Upload error: {str(exc)}")
        raise HTTPException(status_code=500, detail=str(exc))

@app.get("/properties")
async def list_properties():
    """List all properties (debug endpoint)."""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM properties")
        count = cursor.fetchone()[0]
        cursor.execute("SELECT id, title, location, type FROM properties LIMIT 20")
        props = cursor.fetchall()
        conn.close()
        return {
            "total": count,
            "sample": [
                {"id": p[0], "title": p[1], "location": p[2], "type": p[3]}
                for p in props
            ]
        }
    except Exception as e:
        logging.error(f"Error listing properties: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/properties/template")
async def get_template():
    """Get CSV template for property upload."""
    template = """title,description,type,price,bedrooms,bathrooms,location,address,area
Departamento 2 amb Palermo,Luminoso con balcón,compra,85000,2,1,Palermo,Borges 1650,65
Casa 3 amb San Telmo,Con patio,compra,120000,3,2,San Telmo,Defensa 2100,120
Monoambiente Recoleta,Moderno y equipado,alquiler,1200,1,1,Recoleta,Av. Santa Fe 1200,45"""
    return {
        "template": template,
        "required_columns": ["title", "type", "location"],
        "optional_columns": ["description", "price", "bedrooms", "bathrooms", "address", "area"]
    }

@app.get("/debug/hindsight")
async def debug_hindsight(x_admin_token: Optional[str] = Header(None)):
    """Debug endpoint to check Hindsight state. Admin-only (leaks internal facts)."""
    _require_admin(x_admin_token)
    if hermes_client is None:
        return {"error": "hermes client unavailable (no LLM key)"}
    try:
        # Test query
        results = hermes_client.hindsight.query(text="Palermo", tenant_id="demo", top_k=3)
        result_list = [f.content for f in results]
        return {
            "hindsight_type": type(hermes_client.hindsight).__name__,
            "test_query": "Palermo",
            "results_count": len(results),
            "results": result_list
        }
    except Exception as e:
        return {
            "error": str(e),
            "type": type(e).__name__
        }

# --- Prospects (Immobiliarias) ---

@app.get("/prospects")
async def list_prospects(tier: str = None, limit: int = 100, x_admin_token: Optional[str] = Header(None)):
    """List immobiliarias (prospects) for outreach. Admin-only."""
    _require_admin(x_admin_token)
    try:
        conn = get_db()
        cursor = conn.cursor()

        query = "SELECT id, nombre, whatsapp, tier, cant_propiedades, website, plataforma FROM prospects"
        params = []
        if tier and tier != "all":
            query += " WHERE tier = ?"
            params.append(tier)

        query += " ORDER BY tier DESC, cant_propiedades DESC LIMIT ?"
        params.append(limit)

        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()

        return {
            "prospects": [
                {
                    "id": r[0],
                    "nombre": r[1],
                    "whatsapp": r[2],
                    "tier": r[3],
                    "cant_propiedades": r[4],
                    "website": r[5],
                    "plataforma": r[6],
                }
                for r in rows
            ],
            "count": len(rows),
        }
    except Exception as e:
        logging.error(f"List prospects error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/prospects/stats")
async def prospects_stats(x_admin_token: Optional[str] = Header(None)):
    """Prospects summary stats. Admin-only."""
    _require_admin(x_admin_token)
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM prospects")
        total = cursor.fetchone()[0]

        cursor.execute("SELECT tier, COUNT(*) FROM prospects GROUP BY tier ORDER BY tier")
        by_tier = dict(cursor.fetchall())

        cursor.execute("SELECT SUM(cant_propiedades) FROM prospects")
        total_props = cursor.fetchone()[0] or 0

        cursor.execute("SELECT tier, AVG(cant_propiedades) FROM prospects WHERE cant_propiedades > 0 GROUP BY tier")
        avg_props = dict(cursor.fetchall())

        conn.close()

        return {
            "total": total,
            "by_tier": by_tier,
            "total_properties": int(total_props),
            "avg_properties_by_tier": avg_props,
        }
    except Exception as e:
        logging.error(f"Prospects stats error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Catalogs (Dataset B) ---

class CatalogExtractRequest(BaseModel):
    """Request to extract a Tokko catalog."""
    tokko_url: str
    prospect_id: str


def _do_extract(tokko_url: str, prospect_id: str, prospect_name: str, db_path: str) -> tuple:
    """Blocking extraction function (runs in threadpool)."""
    extractor = TokkoExtractor(tokko_url, timeout=15)

    count = extractor.get_property_count()
    logging.info(f"[EXTRACT] Expected ~{count} properties")

    urls = extractor.get_property_listing_urls(max_pages=10)
    logging.info(f"[EXTRACT] Found {len(urls)} property URLs")

    properties = extractor.extract_all()
    logging.info(f"[EXTRACT] Extracted {len(properties)} properties")

    # Convert to RAG format
    rag_properties = extractor.to_rag_format(properties)

    # Load to DB
    loader = CatalogLoader(db_path)
    loaded = loader.load_rag_format(prospect_id, rag_properties)
    loader.close()

    logging.info(f"[EXTRACT] ✓ Loaded {loaded} properties for {prospect_name}")
    return loaded, prospect_name


@app.post("/catalogs/extract")
async def extract_catalog(req: CatalogExtractRequest, x_admin_token: Optional[str] = Header(None)):
    """Extract a Tokko catalog and load to tenant_catalogs table. Admin-only."""
    _require_admin(x_admin_token)

    try:
        prospect_id = req.prospect_id.strip()
        tokko_url = req.tokko_url.strip()

        # Verify prospect exists
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT nombre FROM prospects WHERE id = ?", (prospect_id,))
        prospect = cursor.fetchone()
        conn.close()

        if not prospect:
            raise HTTPException(status_code=404, detail=f"Prospect {prospect_id} not found")

        logging.info(f"[EXTRACT] Starting catalog extraction for {prospect[0]} ({prospect_id})")

        # Run in threadpool to avoid async/sync conflicts with Playwright
        db_path = os.getenv("WAPSELL_DB_PATH", os.path.join(os.path.dirname(__file__), "wapsell.db"))
        loaded, prospect_name = await run_in_threadpool(
            _do_extract, tokko_url, prospect_id, prospect[0], db_path
        )

        return {
            "status": "success",
            "prospect_id": prospect_id,
            "prospect_name": prospect_name,
            "properties_loaded": loaded,
            "message": f"Loaded {loaded} properties from {tokko_url}"
        }

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"[EXTRACT] Error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


@app.get("/catalogs/{prospect_id}")
async def get_prospect_catalog(prospect_id: str, x_admin_token: Optional[str] = Header(None)):
    """Get catalog (properties) for a prospect. Admin-only."""
    _require_admin(x_admin_token)

    try:
        db_path = os.getenv("WAPSELL_DB_PATH", os.path.join(os.path.dirname(__file__), "wapsell.db"))
        loader = CatalogLoader(db_path)
        properties = loader.get_catalog_for_prospect(prospect_id)
        loader.close()

        return {
            "prospect_id": prospect_id,
            "count": len(properties),
            "properties": properties
        }
    except Exception as e:
        logging.error(f"Get catalog error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "wapsell-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
