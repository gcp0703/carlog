#!/usr/bin/env python3
"""
Script to update a user's role to admin in the Neo4j database
"""
import asyncio
import sys
import os

# Add the parent directory to the path so we can import from app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.neo4j_service import Neo4jService


async def make_user_admin(email: str):
    """Update a user's role to admin"""
    neo4j_service = Neo4jService()
    
    try:
        # First, check if the user exists
        user = await neo4j_service.get_user_by_email(email)
        
        if not user:
            print(f"Error: User with email '{email}' not found in database")
            return False
        
        print(f"Found user: {user.email} (ID: {user.id})")
        print(f"Current role: {user.role if hasattr(user, 'role') else 'user'}")
        
        # Update the user's role to admin
        updated_user = await neo4j_service.update_user(user.id, {"role": "admin"})
        
        if updated_user:
            print(f"✅ Successfully updated user role to: admin")
            return True
        else:
            print("❌ Failed to update user")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False
    finally:
        # Close the Neo4j connection
        if hasattr(neo4j_service, '_driver') and neo4j_service._driver:
            neo4j_service._driver.close()


async def main():
    email = "jerry@processinnovations.io"
    print(f"Updating user '{email}' to admin role...")
    
    success = await make_user_admin(email)
    
    if success:
        print("\nUser is now an admin! They will see the Admin link in the navigation menu.")
    else:
        print("\nFailed to update user role.")


if __name__ == "__main__":
    asyncio.run(main())