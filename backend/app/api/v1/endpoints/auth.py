from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core import security
from app.core.config import settings

router = APIRouter()


@router.post("/login", response_model=dict)
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    # TODO: Implement user authentication with Neo4j
    # For now, return a mock token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            form_data.username, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }


@router.post("/register", response_model=dict)
async def register(email: str, password: str) -> Any:
    # TODO: Implement user registration with Neo4j
    return {"message": "User registration endpoint - to be implemented"}