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
from typing import Optional

from fastapi import FastAPI, HTTPException, Request, Response, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, field_validator

# Hermes/Waseller imports
from wapsell.client import WapsellClient
from wapsell.models import Fact, Tenant

try:
    import openpyxl
except ImportError:
    openpyxl = None

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

# --- Database Setup ---

DB_PATH = os.path.join(os.path.dirname(__file__), "wapsell.db")

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

    conn.commit()

    # Seed default properties if table is empty
    cursor.execute("SELECT COUNT(*) FROM properties")
    if cursor.fetchone()[0] == 0:
        seed_properties(cursor)

    conn.commit()
    conn.close()

def get_db():
    """Get database connection."""
    return sqlite3.connect(DB_PATH)

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

def hash_password(password: str) -> str:
    """Hash password using SHA256."""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash."""
    return hash_password(password) == password_hash

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

# --- Chat & Properties Utils ---

def search_properties(query: str, limit: int = 5) -> list:
    """Search properties by keyword (title, description, location)."""
    conn = get_db()
    cursor = conn.cursor()
    search_term = f"%{query}%"

    # Use COLLATE NOCASE for case-insensitive search in SQLite
    cursor.execute("""
        SELECT id, title, description, type, price, bedrooms, location
        FROM properties
        WHERE title LIKE ? COLLATE NOCASE
           OR description LIKE ? COLLATE NOCASE
           OR location LIKE ? COLLATE NOCASE
        LIMIT ?
    """, (search_term, search_term, search_term, limit))

    results = cursor.fetchall()

    # If no results, return random properties as fallback
    if not results:
        cursor.execute("""
            SELECT id, title, description, type, price, bedrooms, location
            FROM properties
            ORDER BY RANDOM()
            LIMIT ?
        """, (limit,))
        results = cursor.fetchall()

    conn.close()
    return results

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

# Initialize Hermes/Wapsell client for RAG
def init_hermes_client():
    """Initialize WapsellClient with properties loaded as Facts in Hindsight."""
    client = WapsellClient()

    # Create a demo tenant
    demo_tenant = Tenant(
        id="demo",
        slug="demo",
        name="Demo Tenant",
        plan="pro",
        created_at=datetime.now(UTC).isoformat()
    )
    client.tenants.create(demo_tenant)

    # Load properties as Facts in Hindsight
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT title, description, type, price, bedrooms, location FROM properties")
    properties = cursor.fetchall()
    conn.close()

    for title, description, prop_type, price, bedrooms, location in properties:
        fact_text = f"{title}. {description}. {bedrooms} dormitorios, {prop_type}, ${price:,.0f}, {location}"
        fact = Fact(
            id=secrets.token_urlsafe(12),
            content=fact_text,
            tenant_id="demo",
            created_at=datetime.now(UTC).isoformat()
        )
        client.hindsight.add_fact(fact)

    return client

hermes_client = init_hermes_client()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
            secure=False,  # Set to True in production with HTTPS
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

        # Create session
        token, expires_at = create_session(user_id)

        # Set HTTP-only session cookie
        response.set_cookie(
            key="wapsell_session",
            value=token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
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
async def chat_message(req: ChatRequest, user_id: str = None):
    """Send a message and get a response from Hermes agent with RAG."""
    try:
        if not user_id:
            raise HTTPException(status_code=401, detail="user_id required")

        user = get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        # Save user message
        save_chat_message(user_id, "user", req.message)

        # Use Hermes agent to generate reply with RAG
        # buyer_id composition: tenant:user_id
        buyer_id = f"demo:{user_id}"

        try:
            # Get agent turn with RAG context and natural language response
            agent_turn = hermes_client.agent_loop.turn(
                message=req.message,
                buyer_id=buyer_id,
                tenant_id="demo"
            )
            reply = agent_turn.reply
        except Exception as e:
            logging.warning(f"Hermes agent error: {str(e)}, falling back to search")
            # Fallback to simple search if agent fails
            properties = search_properties(req.message, limit=3)
            if properties:
                props_info = []
                for prop in properties:
                    prop_id, title, desc, prop_type, price, beds, location = prop
                    price_str = f"${price:,.0f}" if prop_type == "compra" else f"${price:,.0f}/mes"
                    props_info.append(f"• {title} ({beds} dorm) en {location} - {price_str}")
                reply = f"Tenemos opciones interesantes para ti:\n\n" + "\n".join(props_info)
                reply += "\n\n¿Te interesa conocer más detalles de alguno de estos inmuebles?"
            else:
                reply = "En nuestra base de datos tenemos propiedades en compra y alquiler en toda CABA. ¿Qué tipo de inmueble te interesa?"

        # Save agent response
        save_chat_message(user_id, "agent", reply)

        return ChatResponse(reply=reply)

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

        user = get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

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

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "wapsell-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
