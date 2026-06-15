import os
import sqlite3
from datetime import UTC, datetime

DB_PATH = os.getenv(
    "WAPSELL_DB_PATH",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "wapsell.db"),
)


def get_db() -> sqlite3.Connection:
    return sqlite3.connect(DB_PATH)


def init_ml_tables(conn: sqlite3.Connection | None = None) -> None:
    """Create MercadoLibre tables if missing."""
    own = conn is None
    conn = conn or get_db()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ml_accounts (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            ml_user_id INTEGER,
            nickname TEXT,
            access_token TEXT,
            refresh_token TEXT,
            expires_at TEXT,
            scopes TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ml_oauth_pending (
            state TEXT PRIMARY KEY,
            code_verifier TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ml_webhook_events (
            id TEXT PRIMARY KEY,
            topic TEXT,
            resource TEXT,
            ml_user_id INTEGER,
            payload_json TEXT,
            processed INTEGER DEFAULT 0,
            received_at TEXT NOT NULL
        )
    """)

    conn.commit()
    if own:
        conn.close()


def save_tokens(
    *,
    tenant_id: str,
    ml_user_id: int | None,
    nickname: str | None,
    access_token: str,
    refresh_token: str,
    expires_in: int,
    scopes: str | None = None,
) -> str:
    now = datetime.now(UTC).isoformat()
    expires_at = datetime.fromtimestamp(
        datetime.now(UTC).timestamp() + expires_in, tz=UTC
    ).isoformat()
    account_id = f"ml_{tenant_id}_{ml_user_id or 'unknown'}"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO ml_accounts (
            id, tenant_id, ml_user_id, nickname,
            access_token, refresh_token, expires_at, scopes,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            ml_user_id = excluded.ml_user_id,
            nickname = excluded.nickname,
            access_token = excluded.access_token,
            refresh_token = excluded.refresh_token,
            expires_at = excluded.expires_at,
            scopes = excluded.scopes,
            updated_at = excluded.updated_at
        """,
        (
            account_id,
            tenant_id,
            ml_user_id,
            nickname,
            access_token,
            refresh_token,
            expires_at,
            scopes,
            now,
            now,
        ),
    )
    conn.commit()
    conn.close()
    return account_id


def get_platform_account(tenant_id: str = "platform") -> dict | None:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT id, tenant_id, ml_user_id, nickname, access_token,
               refresh_token, expires_at, scopes, updated_at
        FROM ml_accounts
        WHERE tenant_id = ?
        ORDER BY updated_at DESC
        LIMIT 1
        """,
        (tenant_id,),
    )
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    cols = [
        "id", "tenant_id", "ml_user_id", "nickname", "access_token",
        "refresh_token", "expires_at", "scopes", "updated_at",
    ]
    data = dict(zip(cols, row))
    data.pop("access_token", None)
    data.pop("refresh_token", None)
    return data


def save_oauth_pending(state: str, code_verifier: str) -> None:
    now = datetime.now(UTC).isoformat()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT OR REPLACE INTO ml_oauth_pending (state, code_verifier, created_at) VALUES (?, ?, ?)",
        (state, code_verifier, now),
    )
    conn.commit()
    conn.close()


def pop_oauth_pending(state: str) -> str | None:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT code_verifier FROM ml_oauth_pending WHERE state = ?",
        (state,),
    )
    row = cursor.fetchone()
    if row:
        cursor.execute("DELETE FROM ml_oauth_pending WHERE state = ?", (state,))
        conn.commit()
    conn.close()
    return row[0] if row else None
