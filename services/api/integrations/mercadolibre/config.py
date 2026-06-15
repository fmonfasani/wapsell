import os

ML_CLIENT_ID = os.getenv("ML_CLIENT_ID", "")
ML_CLIENT_SECRET = os.getenv("ML_CLIENT_SECRET", "")
ML_REDIRECT_URI = os.getenv(
    "ML_REDIRECT_URI",
    "https://api.wapsell.com/oauth/mercadolibre/callback",
)
ML_SITE_ID = os.getenv("ML_SITE_ID", "MLA")
ML_AUTH_URL = f"https://auth.mercadolibre.com.ar/authorization"
ML_TOKEN_URL = "https://api.mercadolibre.com/oauth/token"
ML_API_BASE = "https://api.mercadolibre.com"

# Platform account used for global property/seller sync (Phase 1+).
ML_PLATFORM_TENANT_ID = os.getenv("ML_PLATFORM_TENANT_ID", "platform")
