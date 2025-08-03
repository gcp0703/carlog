#!/usr/bin/env python3
"""
Migration script to update user nodes in Neo4j
- Removes has_garage and usage_pattern fields
- Adds email_notifications_enabled field
"""

import asyncio
from app.services.neo4j_service import neo4j_service

async def migrate_users():
    """Migrate user nodes to new schema"""
    print("Starting user field migration...")
    
    try:
        with neo4j_service.get_session() as session:
            # First, add email_notifications_enabled to all users that don't have it
            result = session.run("""
                MATCH (u:User)
                WHERE u.email_notifications_enabled IS NULL
                SET u.email_notifications_enabled = true
                RETURN count(u) as updated_count
            """)
            record = result.single()
            print(f"Added email_notifications_enabled to {record['updated_count']} users")
            
            # Remove old fields
            result = session.run("""
                MATCH (u:User)
                REMOVE u.has_garage, u.usage_pattern
                RETURN count(u) as updated_count
            """)
            record = result.single()
            print(f"Removed old fields from {record['updated_count']} users")
            
            # Show sample of updated users
            result = session.run("""
                MATCH (u:User)
                RETURN u.email, u.email_notifications_enabled, u.sms_notifications_enabled
                LIMIT 5
            """)
            
            print("\nSample of migrated users:")
            for record in result:
                print(f"- {record['u.email']}: Email={record['u.email_notifications_enabled']}, SMS={record['u.sms_notifications_enabled']}")
                
    except Exception as e:
        print(f"Migration error: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(migrate_users())
    print("\nMigration completed!")