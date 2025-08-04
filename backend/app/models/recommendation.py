from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class RecommendationBase(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    
    vehicle_id: str
    recommendations: str
    vehicle_mileage_at_generation: int
    maintenance_count_at_generation: int


class RecommendationCreate(RecommendationBase):
    pass


class Recommendation(RecommendationBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())


class ClaudeAPILog(BaseModel):
    id: str
    vehicle_id: str
    request_prompt: str
    response_text: str
    model_used: str
    tokens_used: Optional[int] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())