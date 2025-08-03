"""
Tests for authentication endpoints.
"""
from fastapi.testclient import TestClient


def test_login_endpoint_exists(client: TestClient):
    """Test that login endpoint exists and handles POST requests."""
    # Using form data as expected by OAuth2PasswordRequestForm
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpassword"}
    )
    # Should return 200 with mock token (since authentication is not fully implemented)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "token_type" in data
    assert data["token_type"] == "bearer"


def test_register_endpoint_exists(client: TestClient):
    """Test that register endpoint exists."""
    response = client.post(
        "/api/v1/auth/register",
        params={"email": "newuser@example.com", "password": "newpassword123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "message" in data