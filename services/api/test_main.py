"""Contract tests for the Wapsell API. Run: pytest test_main.py -q

Env is set BEFORE importing the app so it uses a throwaway DB and dev mode
(OPENROUTER_API_KEY is optional now — the chat path is deterministic).
"""
import os
import tempfile

os.environ["WAPSELL_DB_PATH"] = os.path.join(tempfile.gettempdir(), "wapsell_test.db")
os.environ["WAPSELL_ADMIN_TOKEN"] = "test-admin-token"
os.environ["WAPSELL_ENV"] = "dev"            # exposes verify_url for the e2e flow
os.environ.setdefault("OPENROUTER_API_KEY", "")

try:
    os.remove(os.environ["WAPSELL_DB_PATH"])
except OSError:
    pass

import hashlib
import pytest
from fastapi.testclient import TestClient
import main

ADMIN = {"X-Admin-Token": "test-admin-token"}


@pytest.fixture
def client():
    return TestClient(main.app)


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_password_hashing_pbkdf2():
    h = main.hash_password("Secret123")
    assert h.startswith("pbkdf2$")
    assert main.verify_password("Secret123", h)
    assert not main.verify_password("wrong", h)
    # legacy unsalted sha256 still verifies + is flagged for rehash
    legacy = hashlib.sha256("Secret123".encode()).hexdigest()
    assert main.verify_password("Secret123", legacy)
    assert main.needs_rehash(legacy)
    assert not main.needs_rehash(h)


def test_pricing_table(client):
    r = client.get("/pricing")
    assert r.status_code == 200
    plans = r.json()["plans"]
    assert plans["starter"]["ars"] == 49000
    assert plans["pro"]["ars"] == 249000


def test_quote_enterprise_tier(client):
    r = client.post("/quote", json={"conversations": 8000})
    assert r.status_code == 200
    assert r.json()["quote"]["plan"] == "enterprise"


def test_admin_requires_token(client):
    assert client.get("/demo/leads").status_code == 401
    assert client.get("/demo/leads", headers=ADMIN).status_code == 200


def test_chat_requires_identity(client):
    assert client.post("/chat/message", json={"message": "hi"}).status_code == 401
    assert client.post("/chat/message?user_id=nope", json={"message": "hi"}).status_code == 401


def test_chat_sells_wapsell(client):
    sid = client.post("/demo/session").json()["demo_id"]
    pricing = client.post(f"/chat/message?user_id={sid}", json={"message": "precios"})
    assert pricing.status_code == 200
    assert "Starter" in pricing.json()["reply"]
    greeting = client.post(f"/chat/message?user_id={sid}", json={"message": "hola"})
    assert "Wapsell" in greeting.json()["reply"]


def test_demo_funnel_and_promotion(client):
    # session -> capture -> verify -> promoted to a Capa-2 deal
    sid = client.post("/demo/session").json()["demo_id"]
    client.post(f"/chat/message?user_id={sid}", json={"message": "quiero contratar"})
    c = client.post(
        f"/demo/contact?demo_id={sid}",
        json={"name": "Test", "email": "t@example.com", "phone": "+5491100000000"},
    )
    assert c.status_code == 200
    verify_url = c.json().get("verify_url")
    assert verify_url, "verify_url should be exposed in dev"
    token = verify_url.split("token=")[1]
    assert client.get(f"/demo/verify?token={token}").status_code == 200
    deals = client.get("/app/deals", headers=ADMIN).json()
    assert deals["total"] >= 1
    assert any(d["email"] == "t@example.com" for d in deals["deals"])


def test_register_login(client):
    email = "user@example.com"
    reg = client.post("/auth/register", json={"email": email, "password": "Passw0rd", "name": "User"})
    assert reg.status_code in (201, 409)  # 409 if a previous run created it
    login = client.post("/auth/login", json={"email": email, "password": "Passw0rd"})
    assert login.status_code == 200
    assert login.json()["email"] == email
