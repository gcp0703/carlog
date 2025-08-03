"""
Tests for the main FastAPI application.
"""
from fastapi.testclient import TestClient


def test_root_endpoint(client: TestClient):
    """Test the root endpoint returns welcome message."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to CarLog API"}


def test_health_check(client: TestClient):
    """Test that the API is running and accessible."""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()