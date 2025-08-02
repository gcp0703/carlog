from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException

from app.models.user import User, UserCreate, UserUpdate

router = APIRouter()


@router.get("/me", response_model=User)
async def read_user_me() -> Any:
    # TODO: Implement current user retrieval
    return {"message": "Current user endpoint - to be implemented"}


@router.put("/me", response_model=User)
async def update_user_me(user_update: UserUpdate) -> Any:
    # TODO: Implement user update
    return {"message": "Update user endpoint - to be implemented"}


@router.delete("/me")
async def delete_user_me() -> Any:
    # TODO: Implement user deletion
    return {"message": "Delete user endpoint - to be implemented"}