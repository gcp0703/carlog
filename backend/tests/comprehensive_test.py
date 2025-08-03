#!/usr/bin/env python3
"""
Comprehensive test for registration endpoint
This tests various scenarios that could cause 400 errors
"""
import requests
import json
import time
from datetime import datetime


def test_registration_comprehensive(base_url="http://127.0.0.1:8000"):
    """Test registration with comprehensive scenarios"""
    
    print("Comprehensive Registration Test")
    print("=" * 50)
    
    # Wait for server to be ready
    print("Waiting for server to be ready...")
    for i in range(10):
        try:
            response = requests.get(f"{base_url}/", timeout=2)
            if response.status_code == 200:
                print("✅ Server is ready")
                break
        except:
            time.sleep(1)
    else:
        print("❌ Server not ready after 10 seconds")
        return
    
    test_cases = [
        # Valid cases
        {
            "name": "Valid minimal registration",
            "data": {"email": f"test1_{datetime.now().timestamp()}@example.com", "password": "password123"},
            "expected": [200, 201]
        },
        {
            "name": "Valid full registration",
            "data": {
                "email": f"test2_{datetime.now().timestamp()}@example.com",
                "password": "password123",
                "zip_code": "12345",
                "has_garage": True,
                "usage_pattern": "daily"
            },
            "expected": [200, 201]
        },
        
        # Validation errors (should be 422, not 400)
        {
            "name": "Empty email",
            "data": {"email": "", "password": "password123"},
            "expected": [422]
        },
        {
            "name": "Invalid email format",
            "data": {"email": "not-an-email", "password": "password123"},
            "expected": [422]
        },
        {
            "name": "Short password",
            "data": {"email": "test@example.com", "password": "123"},
            "expected": [422]
        },
        {
            "name": "Missing email",
            "data": {"password": "password123"},
            "expected": [422]
        },
        {
            "name": "Missing password",
            "data": {"email": "test@example.com"},
            "expected": [422]
        },
        
        # Edge cases that might cause 400
        {
            "name": "None email",
            "data": {"email": None, "password": "password123"},
            "expected": [422, 400]
        },
        {
            "name": "None password",
            "data": {"email": "test@example.com", "password": None},
            "expected": [422, 400]
        },
        {
            "name": "Whitespace only email",
            "data": {"email": "   ", "password": "password123"},
            "expected": [422, 400]
        },
        {
            "name": "Whitespace only password",
            "data": {"email": "test@example.com", "password": "   "},
            "expected": [422, 400]
        },
        {
            "name": "Very long email",
            "data": {"email": "a" * 300 + "@example.com", "password": "password123"},
            "expected": [422, 400, 200]
        },
        {
            "name": "Email with special characters",
            "data": {"email": "test+tag@example-domain.co.uk", "password": "password123"},
            "expected": [200, 201]
        },
        {
            "name": "Unicode in email",
            "data": {"email": "tëst@example.com", "password": "password123"},
            "expected": [422, 400, 200]
        },
        {
            "name": "Invalid JSON content type",
            "data": {"email": "test@example.com", "password": "password123"},
            "content_type": "application/x-www-form-urlencoded",
            "expected": [422, 400]
        }
    ]
    
    # Test duplicate registration (should be 400)
    duplicate_email = f"duplicate_{datetime.now().timestamp()}@example.com"
    
    # First registration
    print("\\nTesting duplicate registration scenario...")
    first_response = requests.post(
        f"{base_url}/api/v1/auth/register",
        json={"email": duplicate_email, "password": "password123"},
        headers={"Content-Type": "application/json"}
    )
    print(f"First registration: {first_response.status_code}")
    
    # Second registration (should fail with 400)
    test_cases.append({
        "name": "Duplicate email registration",
        "data": {"email": duplicate_email, "password": "password123"},
        "expected": [400]
    })
    
    # Run all test cases
    for i, test_case in enumerate(test_cases, 1):
        print(f"\\nTest {i}: {test_case['name']}")
        print("-" * 40)
        
        headers = {"Content-Type": test_case.get("content_type", "application/json")}
        
        try:
            if test_case.get("content_type") == "application/x-www-form-urlencoded":
                # Send as form data
                response = requests.post(
                    f"{base_url}/api/v1/auth/register",
                    data=test_case["data"],
                    headers=headers,
                    timeout=10
                )
            else:
                # Send as JSON
                response = requests.post(
                    f"{base_url}/api/v1/auth/register",
                    json=test_case["data"],
                    headers=headers,
                    timeout=10
                )
            
            status_code = response.status_code
            expected_codes = test_case["expected"]
            
            if status_code in expected_codes:
                print(f"✅ Status: {status_code} (expected: {expected_codes})")
            else:
                print(f"❌ Status: {status_code} (expected: {expected_codes})")
            
            # Show response details for unexpected results
            if status_code not in expected_codes or status_code == 400:
                print(f"Headers: {dict(response.headers)}")
                try:
                    response_data = response.json()
                    print(f"Response: {json.dumps(response_data, indent=2)}")
                except:
                    print(f"Response text: {response.text}")
                    
        except Exception as e:
            print(f"❌ Request failed: {e}")


if __name__ == "__main__":
    test_registration_comprehensive()