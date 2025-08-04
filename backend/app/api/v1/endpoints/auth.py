import logging
from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import ValidationError

from app.core import security
from app.core.config import settings
from app.models.user import UserCreate, User
from app.services.neo4j_service import neo4j_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/login", response_model=dict)
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    """Authenticate user and return access token"""
    user = await neo4j_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Update last_login timestamp
    try:
        await neo4j_service.update_user(user.id, {"last_login": datetime.utcnow()})
    except Exception as e:
        logger.warning(f"Failed to update last_login for user {user.id}: {e}")
        # Continue login process even if last_login update fails

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.email, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }


@router.post("/register", response_model=User)
async def register(user_data: UserCreate) -> Any:
    """Register a new user"""
    logger.info(f"Registration attempt for email: {user_data.email}")

    # Validate user data explicitly (FastAPI should handle this, but let's be explicit)
    try:
        # Basic validation checks
        if not user_data.email or not user_data.email.strip():
            logger.warning("Registration failed: Empty email provided")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required and cannot be empty",
            )

        if not user_data.password or len(user_data.password) < 1:
            logger.warning(
                f"Registration failed: Empty password for email {user_data.email}"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is required and cannot be empty",
            )

        if len(user_data.password) < 6:
            logger.warning(
                f"Registration failed: Password too short for email {user_data.email}"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters long",
            )

    except ValidationError as e:
        logger.error(f"Validation error during registration for {user_data.email}: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation error: {str(e)}",
        )

    # Check if user already exists
    try:
        existing_user = await neo4j_service.get_user_by_email(user_data.email)
        if existing_user:
            logger.warning(
                f"Registration failed: Email {user_data.email} already registered"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
    except HTTPException:
        # Re-raise HTTP exceptions (like the 400 above) without modification
        raise
    except Exception as e:
        logger.error(
            f"Database error checking existing user for {user_data.email}: {e}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection error while checking existing user",
        )

    # Create the user
    try:
        logger.info(f"Creating user for email: {user_data.email}")
        user_in_db = await neo4j_service.create_user(user_data)
        logger.info(f"User created successfully with ID: {user_in_db.id}")

        # Return user without password
        return User(
            id=user_in_db.id,
            email=user_in_db.email,
            phone_number=user_in_db.phone_number,
            zip_code=user_in_db.zip_code,
            email_notifications_enabled=user_in_db.email_notifications_enabled,
            sms_notifications_enabled=user_in_db.sms_notifications_enabled,
            sms_notification_frequency=user_in_db.sms_notification_frequency,
            maintenance_notification_frequency=user_in_db.maintenance_notification_frequency,
            last_update_request=user_in_db.last_update_request,
            last_maintenance_notification=user_in_db.last_maintenance_notification,
            last_login=user_in_db.last_login,
            role=user_in_db.role,
            account_active=user_in_db.account_active,
        )
    except HTTPException:
        # Re-raise HTTP exceptions without modification
        raise
    except Exception as e:
        logger.error(f"Failed to create user for {user_data.email}: {e}")
        # Check if it's a database constraint error (like unique constraint violation)
        error_str = str(e).lower()
        if (
            "unique" in error_str
            or "constraint" in error_str
            or "duplicate" in error_str
            or "already exists" in error_str
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists in database",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create user: {str(e)}",
            )
