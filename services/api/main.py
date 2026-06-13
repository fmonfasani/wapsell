"""Wapsell Auth API — handles user registration, login, and session management."""

from datetime import UTC, datetime, timedelta
import hashlib
import secrets
import sqlite3
from typing import Optional

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# --- Database Setup ---

DB_PATH = "/tmp/wapsell.db"

def init_db():
    """Initialize SQLite database with users and sessions tables."""
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

    conn.commit()
    conn.close()

def get_db():
    """Get database connection."""
    return sqlite3.connect(DB_PATH)

# --- Models ---

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: str
    email: str
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

# --- FastAPI App ---

app = FastAPI()

# Initialize database
init_db()

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
    """Register a new user."""
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

    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="Email already exists")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@app.post("/auth/login", response_model=UserOut)
async def login(req: LoginRequest, response: Response):
    """Log in a user."""
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
            raise HTTPException(status_code=401, detail="Invalid email or password")

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
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

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

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
