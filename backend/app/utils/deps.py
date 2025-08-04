from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError

from app.core import security
from app.core.config import settings
from app.models.user import User
from app.services.neo4j_service import neo4j_service

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


def get_db() -> Generator:
    try:
        session = neo4j_service.get_session()
        yield session
    finally:
        session.close()


async def get_current_user(token: str = Depends(reusable_oauth2)) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        user_email: str = payload.get("sub")
        if user_email is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Could not validate credentials",
            )
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    
    # Get the user from the database
    user = await neo4j_service.get_user_by_email(user_email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Return the User model (not UserInDB which includes password)
    return User(
        id=user.id,
        email=user.email,
        phone_number=user.phone_number,
        zip_code=user.zip_code,
        email_notifications_enabled=getattr(user, 'email_notifications_enabled', True),
        sms_notifications_enabled=getattr(user, 'sms_notifications_enabled', True),
        sms_notification_frequency=getattr(user, 'sms_notification_frequency', 'monthly'),
        maintenance_notification_frequency=getattr(user, 'maintenance_notification_frequency', 'quarterly'),
        last_update_request=getattr(user, 'last_update_request', None),
        last_maintenance_notification=getattr(user, 'last_maintenance_notification', None),
        last_login=getattr(user, 'last_login', None),
        role=getattr(user, 'role', 'user'),
        account_active=getattr(user, 'account_active', True)
    )
