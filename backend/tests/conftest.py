"""
Test configuration and fixtures for CarLog backend tests.
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI application."""
    return TestClient(app)


@pytest.fixture
def mock_user_token():
    """Mock JWT token for authenticated endpoints."""
    return "mock-jwt-token-for-testing"


@pytest.fixture
def test_user_data():
    """Sample user data for testing."""
    return {
        "email": "test@example.com",
        "password": "testpassword123",
        "full_name": "Test User",
        "phone_number": "+1234567890"
    }


@pytest.fixture
def test_vehicle_data():
    """Sample vehicle data for testing."""
    return {
        "make": "Toyota",
        "model": "Camry",
        "year": 2020,
        "vin": "1HGCM82633A123456",
        "license_plate": "ABC123",
        "current_mileage": 25000
    }


@pytest.fixture
def test_maintenance_data():
    """Sample maintenance record data for testing."""
    return {
        "vehicle_id": "test-vehicle-id",
        "service_type": "Oil Change",
        "mileage": 25000,
        "service_date": "2024-01-15",
        "description": "Regular oil change",
        "cost": 45.99,
        "service_provider": "Quick Lube"
    }