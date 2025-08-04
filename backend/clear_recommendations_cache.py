#!/usr/bin/env python3
"""Clear all cached recommendations to force regeneration with new format"""

import asyncio
import sys

sys.path.append('.')

from app.services.neo4j_service import neo4j_service


async def clear_recommendations_cache():
    """Clear all cached recommendations from Neo4j"""
    try:
        with neo4j_service.get_session() as session:
            # Delete all recommendation nodes and relationships
            result = session.run(
                """
                MATCH (r:Recommendation)
                DETACH DELETE r
                RETURN count(r) as deleted_count
                """
            )
            
            record = result.single()
            count = record["deleted_count"] if record else 0
            
            print(f"Cleared {count} cached recommendations")
            
    except Exception as e:
        print(f"Error clearing cache: {e}")


if __name__ == "__main__":
    asyncio.run(clear_recommendations_cache())