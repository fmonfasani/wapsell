"""Tests for Wapsell Auth API."""

import pytest
from fastapi.testclient import TestClient
from main import app, init_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    """Initialize database before each test."""
    init_db()
    yield
    # Cleanup would go here if needed

class TestHealth:
    def test_health_check(self):
        """Test health endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

class TestAuth:
    def test_register_success(self):
        """Test successful user registration."""
        response = client.post(
            "/auth/register",
            json={
                "email": "test@example.com",
                "password": "Password123",
                "name": "Test User"
            }
        )
        assert response.status_code == 201
        assert response.json()["email"] == "test@example.com"
        assert "id" in response.json()

    def test_register_invalid_email(self):
        """Test registration with invalid email."""
        response = client.post(
            "/auth/register",
            json={
                "email": "invalid-email",
                "password": "Password123",
                "name": "Test User"
            }
        )
        assert response.status_code == 422

    def test_register_weak_password(self):
        """Test registration with weak password."""
        response = client.post(
            "/auth/register",
            json={
                "email": "test@example.com",
                "password": "weak",
                "name": "Test User"
            }
        )
        assert response.status_code == 422

    def test_register_duplicate_email(self):
        """Test registration with duplicate email."""
        # Register first user
        client.post(
            "/auth/register",
            json={
                "email": "test@example.com",
                "password": "Password123",
                "name": "Test User"
            }
        )

        # Try to register with same email
        response = client.post(
            "/auth/register",
            json={
                "email": "test@example.com",
                "password": "Password456",
                "name": "Another User"
            }
        )
        assert response.status_code == 409
        assert "ya está registrado" in response.json()["detail"]

    def test_login_success(self):
        """Test successful login."""
        # Register first
        client.post(
            "/auth/register",
            json={
                "email": "test@example.com",
                "password": "Password123",
                "name": "Test User"
            }
        )

        # Login
        response = client.post(
            "/auth/login",
            json={
                "email": "test@example.com",
                "password": "Password123"
            }
        )
        assert response.status_code == 200
        assert response.json()["email"] == "test@example.com"
        assert "wapsell_session" in response.cookies

    def test_login_invalid_password(self):
        """Test login with wrong password."""
        # Register first
        client.post(
            "/auth/register",
            json={
                "email": "test@example.com",
                "password": "Password123",
                "name": "Test User"
            }
        )

        # Try with wrong password
        response = client.post(
            "/auth/login",
            json={
                "email": "test@example.com",
                "password": "WrongPassword123"
            }
        )
        assert response.status_code == 401
        assert "inválidos" in response.json()["detail"]

    def test_get_me_authenticated(self):
        """Test /auth/me with valid session."""
        # Register and login
        reg_response = client.post(
            "/auth/register",
            json={
                "email": "test@example.com",
                "password": "Password123",
                "name": "Test User"
            }
        )

        # Get me should work with session cookie
        response = client.get("/auth/me")
        assert response.status_code == 200
        assert response.json()["email"] == "test@example.com"

    def test_get_me_unauthenticated(self):
        """Test /auth/me without session."""
        response = client.get("/auth/me")
        assert response.status_code == 401
        assert "not authenticated" in response.json()["detail"]

    def test_logout(self):
        """Test logout clears session."""
        # Register
        client.post(
            "/auth/register",
            json={
                "email": "test@example.com",
                "password": "Password123",
                "name": "Test User"
            }
        )

        # Logout
        response = client.post("/auth/logout")
        assert response.status_code == 204

        # Try to get me - should fail
        response = client.get("/auth/me")
        assert response.status_code == 401

class TestChat:
    def test_chat_message(self):
        """Test chat endpoint."""
        response = client.post(
            "/chat/message",
            json={"message": "Busco algo en Palermo"}
        )
        assert response.status_code == 200
        assert "reply" in response.json()
        assert len(response.json()["reply"]) > 0

    def test_chat_different_topics(self):
        """Test chat with different message topics."""
        test_cases = [
            ("Palermo", "Palermo"),
            ("precio", "precio"),
            ("dormitorios", "dormitorios"),
            ("otro tema", "excelente pregunta"),
        ]

        for message, expected_keyword in test_cases:
            response = client.post(
                "/chat/message",
                json={"message": message}
            )
            assert response.status_code == 200
            assert expected_keyword.lower() in response.json()["reply"].lower()
