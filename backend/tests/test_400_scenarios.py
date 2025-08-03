#!/usr/bin/env python3
"""
Test specific scenarios that could cause 400 Bad Request errors
"""
import asyncio
import json
import sys
import os
from datetime import datetime

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.models.user import UserCreate
from app.services.neo4j_service import neo4j_service


def test_with_client():
    """Test using FastAPI TestClient to avoid server startup complexity"""
    
    print("Testing registration endpoint with TestClient")
    print("=" * 50)
    
    client = TestClient(app)
    
    # Clear any existing test users first
    print("Clearing existing test users...")
    try:
        neo4j_service.connect()
        with neo4j_service.get_session() as session:
            session.run("MATCH (u:User) WHERE u.email CONTAINS 'test_400' DELETE u")
        print("✅ Test users cleared")
    except Exception as e:
        print(f"⚠️ Could not clear test users: {e}")
    
    test_cases = [
        {
            "name": "Valid registration",
            "data": {"email": f"test_400_valid_{datetime.now().timestamp()}@example.com", "password": "password123"},
            "expected_status": [200, 201]
        },
        {
            "name": "Duplicate email (should be 400)",
            "data": {"email": "test_400_duplicate@example.com", "password": "password123"},
            "run_twice": True,
            "expected_status": [400]  # Second call should fail
        },
        {
            "name": "Empty string email",
            "data": {"email": "", "password": "password123"},
            "expected_status": [422, 400]
        },
        {
            "name": "Null email",
            "data": {"email": None, "password": "password123"},
            "expected_status": [422, 400]
        },
        {
            "name": "Whitespace only email",
            "data": {"email": "   ", "password": "password123"},
            "expected_status": [422, 400]
        },
        {
            "name": "Invalid email format",
            "data": {"email": "not-an-email", "password": "password123"},
            "expected_status": [422, 400]
        },
        {
            "name": "Empty password",
            "data": {"email": "test_400@example.com", "password": ""},
            "expected_status": [422, 400]
        },
        {
            "name": "Null password",
            "data": {"email": "test_400_null_pass@example.com", "password": None},
            "expected_status": [422, 400]
        },
        {
            "name": "Short password",
            "data": {"email": "test_400_short@example.com", "password": "123"},
            "expected_status": [422, 400]
        },
        {
            "name": "Whitespace only password",
            "data": {"email": "test_400_whitespace@example.com", "password": "   "},
            "expected_status": [422, 400]
        },
        {
            "name": "Missing email field",
            "data": {"password": "password123"},
            "expected_status": [422, 400]
        },
        {
            "name": "Missing password field",
            "data": {"email": "test_400_missing_pass@example.com"},
            "expected_status": [422, 400]
        },
        {
            "name": "Empty JSON object",
            "data": {},
            "expected_status": [422, 400]
        },
        {
            "name": "Invalid JSON structure",
            "raw_data": '{"email": "test@example.com", "password": "pass123", invalid}',
            "expected_status": [422, 400]
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\\nTest {i}: {test_case['name']}")
        print("-" * 40)
        
        try:
            if test_case.get('run_twice'):
                # First call should succeed
                response1 = client.post("/api/v1/auth/register", json=test_case["data"])
                print(f"First call status: {response1.status_code}")
                
                # Second call should fail with 400
                response = client.post("/api/v1/auth/register", json=test_case["data"])
                print(f"Second call status: {response.status_code}")
            
            elif test_case.get('raw_data'):
                # Send raw data to test JSON parsing errors
                response = client.post(
                    "/api/v1/auth/register",
                    data=test_case['raw_data'],
                    headers={"Content-Type": "application/json"}
                )
            else:
                # Normal test
                response = client.post("/api/v1/auth/register", json=test_case["data"])
            
            status_code = response.status_code
            expected_codes = test_case["expected_status"]
            
            if status_code in expected_codes:
                print(f"✅ Status: {status_code} (expected: {expected_codes})")
            else:
                print(f"❌ Status: {status_code} (expected: {expected_codes})")
            
            # Show response for 400 errors or unexpected results
            if status_code == 400 or status_code not in expected_codes:
                try:
                    response_data = response.json()
                    print(f"Response: {json.dumps(response_data, indent=2)}")
                except:
                    print(f"Response text: {response.text}")
                    
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            import traceback
            traceback.print_exc()


async def test_edge_cases():
    """Test edge cases in the service layer"""
    
    print("\\n\\nTesting edge cases in service layer")
    print("=" * 50)
    
    try:
        # Test with problematic data directly
        edge_cases = [
            {
                "name": "Unicode email",
                "email": "tëst@example.com",
                "password": "password123"
            },
            {
                "name": "Very long email",
                "email": "a" * 200 + "@example.com",
                "password": "password123"
            },
            {
                "name": "Email with quotes",
                "email": 'test"quote@example.com',
                "password": "password123"
            },
            {
                "name": "Password with special chars",
                "email": "testspecial@example.com",
                "password": "pass@123!#$%"
            }
        ]
        
        for case in edge_cases:
            print(f"\\nTesting: {case['name']}")
            try:
                user_data = UserCreate(email=case["email"], password=case["password"])
                print(f"✅ UserCreate validation passed")
                
                # Try to create in database
                created_user = await neo4j_service.create_user(user_data)
                print(f"✅ Database creation succeeded: {created_user.id}")
                
                # Clean up
                with neo4j_service.get_session() as session:
                    session.run("MATCH (u:User {id: $id}) DELETE u", id=created_user.id)
                
            except Exception as e:
                print(f"❌ Failed: {e}")
                
    except Exception as e:
        print(f"❌ Edge case testing failed: {e}")


if __name__ == "__main__":
    # Test with TestClient
    test_with_client()
    
    # Test edge cases
    asyncio.run(test_edge_cases())