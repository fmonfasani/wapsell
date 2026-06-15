import hashlib
import logging
import secrets
import base64
from datetime import UTC, datetime
from urllib.parse import urlencode

import httpx

from integrations.mercadolibre import config
from integrations.mercadolibre.db import get_db, save_tokens

logger = logging.getLogger(__name__)


def generate_pkce() -> tuple[str, str]:
    verifier = secrets.token_urlsafe(64)[:128]
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    challenge = base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")
    return verifier, challenge


def build_authorize_url(*, state: str, code_challenge: str) -> str:
    params = {
        "response_type": "code",
        "client_id": config.ML_CLIENT_ID,
        "redirect_uri": config.ML_REDIRECT_URI,
        "state": state,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
    }
    return f"{config.ML_AUTH_URL}?{urlencode(params)}"


async def exchange_code(code: str, code_verifier: str | None = None) -> dict:
    data = {
        "grant_type": "authorization_code",
        "client_id": config.ML_CLIENT_ID,
        "client_secret": config.ML_CLIENT_SECRET,
        "code": code,
        "redirect_uri": config.ML_REDIRECT_URI,
    }
    if code_verifier:
        data["code_verifier"] = code_verifier

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            config.ML_TOKEN_URL,
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"},
        )
        if resp.status_code >= 400:
            logger.error("ML token exchange failed: %s %s", resp.status_code, resp.text)
            resp.raise_for_status()
        return resp.json()


async def refresh_access_token(refresh_token: str) -> dict:
    data = {
        "grant_type": "refresh_token",
        "client_id": config.ML_CLIENT_ID,
        "client_secret": config.ML_CLIENT_SECRET,
        "refresh_token": refresh_token,
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            config.ML_TOKEN_URL,
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"},
        )
        resp.raise_for_status()
        return resp.json()


async def fetch_ml_user(access_token: str) -> dict:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(
            f"{config.ML_API_BASE}/users/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        resp.raise_for_status()
        return resp.json()


async def persist_token_response(token_data: dict, tenant_id: str | None = None) -> dict:
    access_token = token_data["access_token"]
    refresh_token = token_data.get("refresh_token", "")
    expires_in = int(token_data.get("expires_in", 21600))
    tenant = tenant_id or config.ML_PLATFORM_TENANT_ID

    user = await fetch_ml_user(access_token)
    account_id = save_tokens(
        tenant_id=tenant,
        ml_user_id=user.get("id"),
        nickname=user.get("nickname"),
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
        scopes=token_data.get("scope"),
    )
    return {
        "account_id": account_id,
        "ml_user_id": user.get("id"),
        "nickname": user.get("nickname"),
        "expires_in": expires_in,
    }


async def get_valid_access_token(tenant_id: str | None = None) -> str | None:
    """Return a fresh access token for the platform account, refreshing if needed."""
    tenant = tenant_id or config.ML_PLATFORM_TENANT_ID
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT access_token, refresh_token, expires_at
        FROM ml_accounts WHERE tenant_id = ?
        ORDER BY updated_at DESC LIMIT 1
        """,
        (tenant,),
    )
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None

    access_token, refresh_token, expires_at = row
    if expires_at:
        try:
            exp = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
            if exp > datetime.now(UTC):
                return access_token
        except ValueError:
            pass

    if not refresh_token:
        return access_token

    token_data = await refresh_access_token(refresh_token)
    await persist_token_response(token_data, tenant_id=tenant)
    return token_data["access_token"]
