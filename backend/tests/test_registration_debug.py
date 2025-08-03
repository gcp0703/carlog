#!/usr/bin/env python3
"""
Debug script for testing the registration endpoint
This script helps identify what's causing the 400 Bad Request error
"""
import asyncio
import requests
import json
import sys
from datetime import datetime


def test_registration_endpoint(base_url="http://localhost:8000"):
    """Test the registration endpoint with various scenarios"""
    
    print(f"Testing registration endpoint at {base_url}")
    print("=" * 50)
    
    # Test cases
    test_cases = [
        {
            "name": "Valid registration",
            "data": {
                "email": f"test_{datetime.now().timestamp()}@example.com",
                "password": "testpassword123",
                "zip_code": "12345",
                "has_garage": True,
                "usage_pattern": "daily"
            }
        },
        {
            "name": "Empty email",
            "data": {
                "email": "",
                "password": "testpassword123"
            }
        },
        {
            "name": "Invalid email format",
            "data": {
                "email": "not-an-email",
                "password": "testpassword123"
            }
        },
        {
            "name": "Empty password",
            "data": {
                "email": "test2@example.com",
                "password": ""
            }
        },
        {
            "name": "Short password",
            "data": {
                "email": "test3@example.com",
                "password": "123"
            }
        },
        {
            "name": "Missing password field",
            "data": {
                "email": "test4@example.com"
            }
        },
        {
            "name": "Missing email field",
            "data": {
                "password": "testpassword123"
            }
        },
        {
            "name": "Empty request body",
            "data": {}
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest {i}: {test_case['name']}")
        print("-" * 30)
        
        try:
            response = requests.post(
                f"{base_url}/api/v1/auth/register",
                json=test_case["data"],
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Headers: {dict(response.headers)}")
            
            try:
                response_data = response.json()
                print(f"Response: {json.dumps(response_data, indent=2)}")
            except json.JSONDecodeError:
                print(f"Response Text: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Connection Error: Is the server running?")
        except requests.exceptions.Timeout:
            print("❌ Timeout Error: Server took too long to respond")
        except Exception as e:
            print(f"❌ Unexpected Error: {e}")
            
        print()


def check_server_health(base_url="http://localhost:8000"):
    """Check if the server is running and healthy"""
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code == 200:
            print("✅ Server is running and responsive")
            return True
        else:
            print(f"⚠️ Server responded with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Is it running?")
        return False
    except Exception as e:
        print(f"❌ Error checking server health: {e}")
        return False


def check_database_connection():
    """Check if we can import the neo4j service and test connection"""
    print("\nChecking database connection...")
    try:
        sys.path.insert(0, '/Users/gcp/Projects/carlog/backend')
        from app.services.neo4j_service import neo4j_service
        from app.core.config import settings
        
        print(f"Neo4j URI: {settings.NEO4J_URI}")
        print(f"Neo4j User: {settings.NEO4J_USER}")
        print(f"Neo4j Password configured: {'Yes' if settings.NEO4J_PASSWORD else 'No'}")
        
        # Try to connect
        neo4j_service.connect()
        session = neo4j_service.get_session()
        result = session.run("RETURN 'Hello World' as message")
        record = result.single()
        session.close()
        
        if record:
            print("✅ Database connection successful")
            return True
        else:
            print("❌ Database connection failed - no response")
            return False
            
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return False


if __name__ == "__main__":
    print("CarLog Registration Endpoint Debug Tool")
    print("=" * 50)
    
    # Check server health first
    if check_server_health():
        # Check database connection
        check_database_connection()
        
        # Run registration tests
        test_registration_endpoint()
    else:
        print("\nPlease start the server first with:")
        print("cd /Users/gcp/Projects/carlog/backend")
        print("source .venv/bin/activate")
        print("uvicorn app.main:app --reload")