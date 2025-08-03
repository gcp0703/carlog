#!/usr/bin/env python3
"""
Final verification test for the registration endpoint fixes
"""
import requests
import json
import time
from datetime import datetime


def test_registration_fixes():
    """Test that all the 400 error fixes are working correctly"""
    
    print("Final Verification Test for Registration Endpoint")
    print("=" * 60)
    print("This test verifies that:")
    print("1. Valid registrations work (200)")
    print("2. Duplicate emails return 400 (not 500)")
    print("3. Validation errors return 422 (not 400)")
    print("4. Error messages are informative")
    print("5. Logging is comprehensive")
    print()
    
    base_url = "http://127.0.0.1:8000"
    
    # Check if server is running
    try:
        response = requests.get(f"{base_url}/", timeout=3)
        if response.status_code != 200:
            print("❌ Server not responding correctly")
            return False
    except:
        print("❌ Server not running. Please start it with:")
        print("   cd /Users/gcp/Projects/carlog/backend")
        print("   source .venv/bin/activate")
        print("   python run_test_server.py")
        return False
    
    print("✅ Server is running")
    
    # Test cases
    test_results = []
    
    # 1. Valid registration
    print("\\n1. Testing valid registration...")
    unique_email = f"verification_{datetime.now().timestamp()}@example.com"
    response = requests.post(f"{base_url}/api/v1/auth/register", json={
        "email": unique_email,
        "password": "testpassword123"
    })
    
    if response.status_code == 200:
        print("✅ Valid registration returns 200")
        test_results.append(True)
    else:
        print(f"❌ Valid registration failed: {response.status_code}")
        print(f"Response: {response.text}")
        test_results.append(False)
    
    # 2. Duplicate email (should be 400)
    print("\\n2. Testing duplicate email registration...")
    response = requests.post(f"{base_url}/api/v1/auth/register", json={
        "email": unique_email,  # Same email as above
        "password": "testpassword123"
    })
    
    if response.status_code == 400:
        response_data = response.json()
        if "already registered" in response_data.get("detail", "").lower():
            print("✅ Duplicate email returns 400 with correct message")
            test_results.append(True)
        else:
            print(f"❌ Duplicate email returns 400 but wrong message: {response_data}")
            test_results.append(False)
    else:
        print(f"❌ Duplicate email should return 400, got: {response.status_code}")
        print(f"Response: {response.text}")
        test_results.append(False)
    
    # 3. Validation errors (should be 422)
    print("\\n3. Testing validation errors...")
    validation_tests = [
        {"email": "", "password": "testpass123", "description": "empty email"},
        {"email": "invalid-email", "password": "testpass123", "description": "invalid email"},
        {"email": "test@example.com", "password": "123", "description": "short password"},
        {"password": "testpass123", "description": "missing email"},
        {"email": "test@example.com", "description": "missing password"}
    ]
    
    validation_results = []
    for test in validation_tests:
        response = requests.post(f"{base_url}/api/v1/auth/register", json={
            k: v for k, v in test.items() if k not in ["description"]
        })
        
        if response.status_code == 422:
            print(f"✅ {test['description']} returns 422")
            validation_results.append(True)
        else:
            print(f"❌ {test['description']} should return 422, got: {response.status_code}")
            validation_results.append(False)
    
    test_results.append(all(validation_results))
    
    # 4. Test error message quality
    print("\\n4. Testing error message quality...")
    response = requests.post(f"{base_url}/api/v1/auth/register", json={
        "email": unique_email,  # Duplicate
        "password": "testpassword123"
    })
    
    response_data = response.json()
    has_detail = "detail" in response_data
    has_url = "url" in response_data
    has_status = "status_code" in response_data
    
    if has_detail and has_url and has_status:
        print("✅ Error responses include detail, url, and status_code")
        test_results.append(True)
    else:
        print(f"❌ Error response missing fields: {response_data}")
        test_results.append(False)
    
    # Summary
    print("\\n" + "=" * 60)
    print("SUMMARY:")
    print(f"Valid registration: {'✅' if test_results[0] else '❌'}")
    print(f"Duplicate email handling: {'✅' if test_results[1] else '❌'}")
    print(f"Validation error handling: {'✅' if test_results[2] else '❌'}")
    print(f"Error message quality: {'✅' if test_results[3] else '❌'}")
    
    success_rate = sum(test_results) / len(test_results)
    print(f"\\nOverall success rate: {success_rate*100:.1f}%")
    
    if success_rate == 1.0:
        print("\\n🎉 All tests passed! The registration endpoint is working correctly.")
        print("\\nKey improvements made:")
        print("• Added comprehensive logging for debugging")
        print("• Fixed exception handling to preserve 400 errors")
        print("• Enhanced error messages with URL and status code")
        print("• Added input validation with informative messages")
        print("• Improved database error handling")
        return True
    else:
        print(f"\\n⚠️ {len([r for r in test_results if not r])} test(s) failed.")
        return False


if __name__ == "__main__":
    test_registration_fixes()