#!/usr/bin/env python3
"""
Migration script to add license_country and license_state fields to vehicle nodes in Neo4j
"""

import asyncio
from app.services.neo4j_service import neo4j_service

async def migrate_license_fields():
    """Migrate vehicle nodes to add license_country and license_state fields"""
    print("Starting vehicle license field migration...")
    
    try:
        with neo4j_service.get_session() as session:
            # Add default license_country = 'USA' to all vehicles that don't have it
            result = session.run("""
                MATCH (v:Vehicle)
                WHERE v.license_country IS NULL
                SET v.license_country = 'USA'
                RETURN count(v) as updated_count
            """)
            record = result.single()
            print(f"Added license_country='USA' to {record['updated_count']} vehicles")
            
            # Show sample of updated vehicles
            result = session.run("""
                MATCH (v:Vehicle)
                RETURN v.brand, v.model, v.year, v.license_plate, v.license_country, v.license_state
                LIMIT 5
            """)
            
            print("\nSample of migrated vehicles:")
            for record in result:
                print(f"- {record['v.year']} {record['v.brand']} {record['v.model']}")
                if record.get('v.license_plate'):
                    print(f"  License: {record.get('v.license_state', '')} {record['v.license_plate']} ({record.get('v.license_country', 'USA')})")
                
    except Exception as e:
        print(f"Migration error: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(migrate_license_fields())
    print("\nMigration completed!")