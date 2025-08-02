from typing import Optional
from pydantic import BaseModel


class VehicleBase(BaseModel):
    make: str
    model: str
    year: int
    vin: Optional[str] = None
    license_plate: Optional[str] = None
    current_mileage: Optional[int] = None


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    vin: Optional[str] = None
    license_plate: Optional[str] = None
    current_mileage: Optional[int] = None


class VehicleInDBBase(VehicleBase):
    id: str
    owner_id: str
    
    class Config:
        from_attributes = True


class Vehicle(VehicleInDBBase):
    pass