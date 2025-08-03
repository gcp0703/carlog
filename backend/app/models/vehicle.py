from typing import Optional
from pydantic import BaseModel


class VehicleBase(BaseModel):
    brand: str
    brand_id: Optional[int] = None
    model: str
    model_id: Optional[int] = None
    year: int
    trim: Optional[str] = None
    trim_id: Optional[int] = None
    zip_code: Optional[str] = None
    usage_pattern: Optional[str] = None
    usage_notes: Optional[str] = None
    vin: Optional[str] = None
    license_plate: Optional[str] = None
    license_country: Optional[str] = "USA"
    license_state: Optional[str] = None
    current_mileage: Optional[int] = None


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    brand: Optional[str] = None
    brand_id: Optional[int] = None
    model: Optional[str] = None
    model_id: Optional[int] = None
    year: Optional[int] = None
    trim: Optional[str] = None
    trim_id: Optional[int] = None
    zip_code: Optional[str] = None
    usage_pattern: Optional[str] = None
    usage_notes: Optional[str] = None
    vin: Optional[str] = None
    license_plate: Optional[str] = None
    license_country: Optional[str] = None
    license_state: Optional[str] = None
    current_mileage: Optional[int] = None


class VehicleInDBBase(VehicleBase):
    id: str
    owner_id: str

    class Config:
        from_attributes = True


class Vehicle(VehicleInDBBase):
    pass
