import pytest
from httpx import AsyncClient
from app.main import app
from app.services.neo4j_service import neo4j_service
from app.core.config import settings


@pytest.fixture(scope="module")
def setup_neo4j():
    """Ensure Neo4j is connected for integration tests"""
    neo4j_service.connect()
    yield
    neo4j_service.close()


@pytest.mark.integration
@pytest.mark.asyncio
async def test_neo4j_connection(setup_neo4j):
    """Test that we can connect to Neo4j database"""
    # This test requires Neo4j to be running
    try:
        # Test the connection
        with neo4j_service.get_session() as session:
            result = session.run("RETURN 1 as num")
            record = result.single()
            assert record["num"] == 1
    except Exception as e:
        pytest.fail(f"Failed to connect to Neo4j: {str(e)}")


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.skip(reason="Auth endpoints not yet implemented")
async def test_full_user_registration_flow(setup_neo4j):
    """Integration test for complete user registration flow"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Register a new user
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "integration@test.com",
                "password": "testpassword123",
                "zip_code": "12345",
                "has_garage": True,
                "usage_pattern": "daily"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "integration@test.com"
        assert "id" in data
        
        # Clean up - delete the test user
        with neo4j_service.get_session() as session:
            session.run(
                "MATCH (u:User {email: $email}) DELETE u",
                email="integration@test.com"
            )


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.skip(reason="Vehicle endpoints not yet implemented")
async def test_vehicle_crud_flow(setup_neo4j):
    """Integration test for vehicle CRUD operations"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # First create a test user and get token
        register_response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "vehicle_test@test.com",
                "password": "testpassword123",
                "zip_code": "12345",
                "has_garage": False,
                "usage_pattern": "weekly"
            }
        )
        assert register_response.status_code == 200
        user_data = register_response.json()
        user_id = user_data["id"]
        
        # Login to get token
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": "vehicle_test@test.com",
                "password": "testpassword123"
            }
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create a vehicle
        vehicle_response = await client.post(
            "/api/v1/vehicles/",
            json={
                "make": "Toyota",
                "model": "Camry",
                "year": 2022,
                "vin": "TEST123456789",
                "license_plate": "TEST123"
            },
            headers=headers
        )
        assert vehicle_response.status_code == 200
        vehicle_data = vehicle_response.json()
        assert vehicle_data["make"] == "Toyota"
        
        # Clean up
        with neo4j_service.get_session() as session:
            session.run(
                "MATCH (u:User {email: $email})-[:OWNS]->(v:Vehicle) DELETE v",
                email="vehicle_test@test.com"
            )
            session.run(
                "MATCH (u:User {email: $email}) DELETE u",
                email="vehicle_test@test.com"
            )