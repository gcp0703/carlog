from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class MaintenanceBase(BaseModel):
    vehicle_id: str
    service_type: str
    mileage: int
    service_date: date
    description: Optional[str] = None
    cost: Optional[float] = None
    service_provider: Optional[str] = None


class MaintenanceCreate(MaintenanceBase):
    pass


class MaintenanceUpdate(BaseModel):
    service_type: Optional[str] = None
    mileage: Optional[int] = None
    service_date: Optional[date] = None
    description: Optional[str] = None
    cost: Optional[float] = None
    service_provider: Optional[str] = None


class MaintenanceInDBBase(MaintenanceBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class Maintenance(MaintenanceInDBBase):
    pass


class MaintenanceSchedule(BaseModel):
    vehicle_id: str
    service_type: str
    interval_miles: Optional[int] = None
    interval_months: Optional[int] = None
    last_service_mileage: Optional[int] = None
    last_service_date: Optional[date] = None
    next_service_mileage: Optional[int] = None
    next_service_date: Optional[date] = None