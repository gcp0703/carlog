from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserBase(BaseModel):
    email: EmailStr
    phone_number: Optional[str] = None
    zip_code: Optional[str] = None
    email_notifications_enabled: Optional[bool] = True
    sms_notifications_enabled: Optional[bool] = True
    sms_notification_frequency: Optional[
        Literal["weekly", "monthly", "quarterly"]
    ] = "monthly"
    maintenance_notification_frequency: Optional[
        Literal["monthly", "quarterly", "annually"]
    ] = "quarterly"
    last_update_request: Optional[datetime] = None
    last_maintenance_notification: Optional[datetime] = None
    last_login: Optional[datetime] = None
    role: Optional[Literal["admin", "manager", "user"]] = "user"
    account_active: Optional[bool] = True


class UserCreate(UserBase):
    password: str = Field(
        ..., min_length=6, description="Password must be at least 6 characters long"
    )

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if not v or not v.strip():
            raise ValueError("Password cannot be empty")
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long")
        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        if not v or not str(v).strip():
            raise ValueError("Email cannot be empty")
        return v


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    zip_code: Optional[str] = None
    email_notifications_enabled: Optional[bool] = None
    sms_notifications_enabled: Optional[bool] = None
    sms_notification_frequency: Optional[
        Literal["weekly", "monthly", "quarterly"]
    ] = None
    maintenance_notification_frequency: Optional[
        Literal["monthly", "quarterly", "annually"]
    ] = None
    last_update_request: Optional[datetime] = None
    last_maintenance_notification: Optional[datetime] = None
    last_login: Optional[datetime] = None
    role: Optional[Literal["admin", "manager", "user"]] = None
    account_active: Optional[bool] = None
    password: Optional[str] = None


class UserInDBBase(UserBase):
    id: str

    model_config = {"from_attributes": True}


class User(UserInDBBase):
    pass


class UserInDB(UserInDBBase):
    hashed_password: str


class UserWithVehicleCount(User):
    vehicle_count: int = 0
