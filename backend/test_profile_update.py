#!/usr/bin/env python3
"""
Test profile update functionality
"""

import asyncio
import httpx
from datetime import datetime

# Test configuration
API_URL = "http://localhost:8000/api/v1"
TEST_EMAIL = f"test_profile_{int(datetime.now().timestamp())}@example.com"
TEST_PASSWORD = "testpass123"

async def test_profile_update():
    async with httpx.AsyncClient() as client:
        # 1. Register a new user
        print("1. Registering test user...")
        register_response = await client.post(
            f"{API_URL}/auth/register",
            json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            }
        )
        
        if register_response.status_code not in [200, 201]:
            print(f"❌ Registration failed: {register_response.text}")
            return
        
        print("✅ User registered successfully")
        
        # 2. Login to get access token
        print("\n2. Logging in...")
        login_response = await client.post(
            f"{API_URL}/auth/login",
            data={
                "username": TEST_EMAIL,
                "password": TEST_PASSWORD
            }
        )
        
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.text}")
            return
        
        token_data = login_response.json()
        access_token = token_data["access_token"]
        print("✅ Login successful")
        
        # 3. Get current user info
        print("\n3. Getting current user info...")
        headers = {"Authorization": f"Bearer {access_token}"}
        
        user_response = await client.get(f"{API_URL}/users/me", headers=headers)
        if user_response.status_code != 200:
            print(f"❌ Failed to get user info: {user_response.text}")
            return
        
        user_data = user_response.json()
        print(f"✅ Current user: {user_data}")
        
        # 4. Update profile (only profile fields, no email)
        print("\n4. Updating profile...")
        profile_update = {
            "zip_code": "80439",
            "has_garage": True,
            "usage_pattern": "Weekend Driver"
        }
        
        update_response = await client.put(
            f"{API_URL}/users/me",
            json=profile_update,
            headers=headers
        )
        
        if update_response.status_code != 200:
            print(f"❌ Profile update failed: {update_response.text}")
            print(f"Status code: {update_response.status_code}")
            return
        
        updated_user = update_response.json()
        print(f"✅ Profile updated successfully: {updated_user}")
        
        # 5. Verify the update
        print("\n5. Verifying update...")
        verify_response = await client.get(f"{API_URL}/users/me", headers=headers)
        if verify_response.status_code == 200:
            final_user = verify_response.json()
            print(f"✅ Updated user data: {final_user}")
            
            # Check if all fields were updated correctly
            if (final_user.get("zip_code") == "80439" and 
                final_user.get("has_garage") == True and 
                final_user.get("usage_pattern") == "Weekend Driver"):
                print("\n🎉 All profile fields updated correctly!")
            else:
                print("\n⚠️  Some fields may not have been updated correctly")
        else:
            print(f"❌ Failed to verify update: {verify_response.text}")

if __name__ == "__main__":
    asyncio.run(test_profile_update())