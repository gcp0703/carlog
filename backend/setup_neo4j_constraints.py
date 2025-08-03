#!/usr/bin/env python3
"""
Set up Neo4j constraints and indexes for the CarLog application
This ensures email uniqueness and proper performance
"""
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.neo4j_service import neo4j_service
from app.core.config import settings


def setup_constraints():
    """Set up database constraints and indexes"""
    print("Setting up Neo4j constraints and indexes...")
    print(f"Connecting to: {settings.NEO4J_URI}")
    
    try:
        neo4j_service.connect()
        
        with neo4j_service.get_session() as session:
            print("\n1. Creating unique constraint on User.email...")
            try:
                session.run("CREATE CONSTRAINT user_email_unique IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE")
                print("✅ Unique constraint on User.email created/verified")
            except Exception as e:
                print(f"⚠️ Constraint creation note: {e}")
            
            print("\n2. Creating unique constraint on User.id...")
            try:
                session.run("CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE")
                print("✅ Unique constraint on User.id created/verified")
            except Exception as e:
                print(f"⚠️ Constraint creation note: {e}")
            
            print("\n3. Creating index on User.email for performance...")
            try:
                session.run("CREATE INDEX user_email_index IF NOT EXISTS FOR (u:User) ON (u.email)")
                print("✅ Index on User.email created/verified")
            except Exception as e:
                print(f"⚠️ Index creation note: {e}")
            
            print("\n4. Listing all constraints...")
            result = session.run("SHOW CONSTRAINTS")
            constraints = list(result)
            if constraints:
                for constraint in constraints:
                    print(f"  - {constraint}")
            else:
                print("  No constraints found")
            
            print("\n5. Listing all indexes...")
            result = session.run("SHOW INDEXES")
            indexes = list(result)
            if indexes:
                for index in indexes:
                    print(f"  - {index}")
            else:
                print("  No indexes found")
                
            print("\n6. Checking existing users...")
            result = session.run("MATCH (u:User) RETURN u.email, u.id LIMIT 10")
            users = list(result)
            print(f"Found {len(users)} existing users:")
            for user in users:
                print(f"  - {user['u.email']} (ID: {user['u.id']})")
                
    except Exception as e:
        print(f"❌ Error setting up constraints: {e}")
        return False
    
    print("\n✅ Database setup completed successfully!")
    return True


def clear_test_users():
    """Clear any test users that might be causing conflicts"""
    print("\nClearing test users...")
    
    try:
        with neo4j_service.get_session() as session:
            # Delete users with test emails
            result = session.run("""
                MATCH (u:User) 
                WHERE u.email CONTAINS 'test' OR u.email CONTAINS 'example.com'
                RETURN u.email
            """)
            test_users = list(result)
            
            if test_users:
                print(f"Found {len(test_users)} test users to delete:")
                for user in test_users:
                    print(f"  - {user['u.email']}")
                
                # Delete them
                session.run("""
                    MATCH (u:User) 
                    WHERE u.email CONTAINS 'test' OR u.email CONTAINS 'example.com'
                    DELETE u
                """)
                print("✅ Test users deleted")
            else:
                print("No test users found")
                
    except Exception as e:
        print(f"❌ Error clearing test users: {e}")


if __name__ == "__main__":
    print("CarLog Neo4j Database Setup")
    print("=" * 40)
    
    # Clear test users first
    clear_test_users()
    
    # Set up constraints
    setup_constraints()
    
    print("\nDatabase is ready for testing!")