from neo4j import GraphDatabase
from typing import Optional

from app.core.config import settings


class Neo4jService:
    def __init__(self):
        self.driver = None
        
    def connect(self):
        self.driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
        )
        
    def close(self):
        if self.driver:
            self.driver.close()
            
    def get_session(self):
        if not self.driver:
            self.connect()
        return self.driver.session()


neo4j_service = Neo4jService()