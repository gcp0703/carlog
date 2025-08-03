#!/usr/bin/env python3
"""
Migration script to update vehicle nodes in Neo4j
- Removes is_garaged field
"""

import asyncio
from app.services.neo4j_service import neo4j_service

async def migrate_vehicles():
    """Migrate vehicle nodes to new schema"""
    print("Starting vehicle field migration...")
    
    try:
        with neo4j_service.get_session() as session:
            # Remove is_garaged field from all vehicles
            result = session.run("""
                MATCH (v:Vehicle)
                WHERE v.is_garaged IS NOT NULL
                REMOVE v.is_garaged
                RETURN count(v) as updated_count
            """)
            record = result.single()
            print(f"Removed is_garaged from {record['updated_count']} vehicles")
            
            # Show sample of updated vehicles
            result = session.run("""
                MATCH (v:Vehicle)
                RETURN v.brand, v.model, v.year, v.trim, v.usage_pattern
                LIMIT 5
            """)
            
            print("\nSample of migrated vehicles:")
            for record in result:
                print(f"- {record['v.year']} {record['v.brand']} {record['v.model']} {record.get('v.trim', '')}")
                
    except Exception as e:
        print(f"Migration error: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(migrate_vehicles())
    print("\nMigration completed!")