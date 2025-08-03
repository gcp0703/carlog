from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserBase(BaseModel):
    email: EmailStr
    phone_number: Optional[str] = None
    zip_code: Optional[str] = None
    email_notifications_enabled: Optional[bool] = True
    sms_notifications_enabled: Optional[bool] = True
    account_active: Optional[bool] = True


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters long")
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if not v or not v.strip():
            raise ValueError('Password cannot be empty')
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        if not v or not str(v).strip():
            raise ValueError('Email cannot be empty')
        return v


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    zip_code: Optional[str] = None
    email_notifications_enabled: Optional[bool] = None
    sms_notifications_enabled: Optional[bool] = None
    account_active: Optional[bool] = None
    password: Optional[str] = None


class UserInDBBase(UserBase):
    id: str

    model_config = {"from_attributes": True}


class User(UserInDBBase):
    pass


class UserInDB(UserInDBBase):
    hashed_password: str
