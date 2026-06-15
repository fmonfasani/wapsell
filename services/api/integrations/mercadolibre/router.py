import json
import logging
import os
import secrets
import uuid
from datetime import UTC, datetime
from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Query, Request
from fastapi.responses import HTMLResponse, RedirectResponse

from integrations.mercadolibre import auth, config
from integrations.mercadolibre.db import (
    get_db,
    get_platform_account,
    pop_oauth_pending,
    save_oauth_pending,
)

logger = logging.getLogger(__name__)

router = APIRouter(tags=["mercadolibre"])

ADMIN_TOKEN = os.getenv("WAPSELL_ADMIN_TOKEN", "")


def _require_admin(token: Optional[str]) -> None:
    if not ADMIN_TOKEN or token != ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Admin token required")


@router.get("/oauth/mercadolibre/callback")
async def oauth_callback(
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
):
    """
    MercadoLibre OAuth redirect URI.
    Without ?code= returns setup instructions.
    With ?code= exchanges for tokens and stores them in ml_accounts.
    """
    if error:
        raise HTTPException(status_code=400, detail=f"ML OAuth error: {error}")

    if not code:
        configured = bool(config.ML_CLIENT_ID and config.ML_CLIENT_SECRET)
        account = get_platform_account()
        return HTMLResponse(
            f"""<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><title>Wapsell · MercadoLibre OAuth</title>
<style>body{{font-family:system-ui;max-width:640px;margin:2rem auto;padding:0 1rem}}
.ok{{color:#059669}}.warn{{color:#d97706}}a.btn{{display:inline-block;margin-top:1rem;padding:.75rem 1.25rem;
background:#f97316;color:#fff;text-decoration:none;border-radius:8px;font-weight:600}}</style></head>
<body>
<h1>MercadoLibre OAuth</h1>
<p>Redirect URI activo en <strong>{config.ML_REDIRECT_URI}</strong></p>
<p>Cliente ML configurado: <span class="{'ok' if configured else 'warn'}">
{'sí' if configured else 'no — falta ML_CLIENT_ID / ML_CLIENT_SECRET en .env'}</span></p>
<p>Cuenta conectada: <span class="{'ok' if account else 'warn'}">
{'sí — user ' + str(account.get('ml_user_id')) + ' (' + str(account.get('nickname')) + ')' if account else 'no'}</span></p>
<p>Para autorizar, abrí (requiere admin token):</p>
<p><a class="btn" href="/oauth/mercadolibre/start">Conectar MercadoLibre</a></p>
<p style="color:#666;font-size:.9rem">Si tenés <code>WAPSELL_ADMIN_TOKEN</code>, usá:<br>
<code>/oauth/mercadolibre/start?token=TU_ADMIN_TOKEN</code></p>
</body></html>"""
        )

    if not config.ML_CLIENT_ID or not config.ML_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="ML_CLIENT_ID and ML_CLIENT_SECRET must be set before OAuth callback",
        )

    code_verifier = pop_oauth_pending(state) if state else None
    try:
        token_data = await auth.exchange_code(code, code_verifier=code_verifier)
        result = await auth.persist_token_response(token_data)
    except Exception as exc:
        logger.exception("ML OAuth callback failed")
        raise HTTPException(status_code=502, detail=f"Token exchange failed: {exc}") from exc

    return HTMLResponse(
        f"""<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><title>ML conectado</title>
<style>body{{font-family:system-ui;max-width:640px;margin:2rem auto;padding:0 1rem}}.ok{{color:#059669}}</style></head>
<body>
<h1 class="ok">MercadoLibre conectado</h1>
<ul>
<li>ML user_id: <strong>{result.get('ml_user_id')}</strong></li>
<li>Nickname: <strong>{result.get('nickname')}</strong></li>
<li>Account id: <code>{result.get('account_id')}</code></li>
</ul>
<p>Los tokens quedaron guardados en <code>ml_accounts</code>. Ya podés usar la API de ML desde Wapsell.</p>
<p>Verificá en Mercado Libre Developers → Administrar permisos que aparezca tu usuario.</p>
</body></html>"""
    )


@router.get("/oauth/mercadolibre/start")
async def oauth_start(
    x_admin_token: Optional[str] = Header(None),
    token: Optional[str] = Query(None),
):
    """Start OAuth with PKCE — redirects browser to MercadoLibre."""
    _require_admin(x_admin_token or token)

    if not config.ML_CLIENT_ID or not config.ML_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="ML_CLIENT_ID and ML_CLIENT_SECRET not configured")

    state = secrets.token_urlsafe(32)
    verifier, challenge = auth.generate_pkce()
    save_oauth_pending(state, verifier)
    url = auth.build_authorize_url(state=state, code_challenge=challenge)
    return RedirectResponse(url=url, status_code=302)


@router.get("/integrations/mercadolibre/status")
async def integration_status(x_admin_token: Optional[str] = Header(None)):
    """Admin: connection status without exposing tokens."""
    _require_admin(x_admin_token)
    account = get_platform_account()
    return {
        "configured": bool(config.ML_CLIENT_ID and config.ML_CLIENT_SECRET),
        "redirect_uri": config.ML_REDIRECT_URI,
        "connected": account is not None,
        "account": account,
    }


@router.post("/integrations/mercadolibre/webhook")
async def mercadolibre_webhook(request: Request):
    """
    MercadoLibre notifications (VIS Leads, items, etc.).
    Phase 0: acknowledge and persist raw payload for inspection.
    """
    try:
        body = await request.json()
    except Exception:
        body = {"raw": (await request.body()).decode("utf-8", errors="replace")}

    event_id = str(uuid.uuid4())
    conn_db = get_db()
    cursor = conn_db.cursor()
    cursor.execute(
        """
        INSERT INTO ml_webhook_events (id, topic, resource, ml_user_id, payload_json, received_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            event_id,
            body.get("topic"),
            body.get("resource"),
            body.get("user_id"),
            json.dumps(body, ensure_ascii=False),
            datetime.now(UTC).isoformat(),
        ),
    )
    conn_db.commit()
    conn_db.close()

    logger.info("ML webhook received topic=%s resource=%s", body.get("topic"), body.get("resource"))
    return {"received": True, "id": event_id}
