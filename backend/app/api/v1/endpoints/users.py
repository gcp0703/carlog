from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.models.user import User, UserUpdate
from app.services.neo4j_service import neo4j_service
from app.utils.deps import get_current_user

router = APIRouter()


@router.get("/me", response_model=User)
async def read_user_me(current_user: User = Depends(get_current_user)) -> Any:
    """Get current user information"""
    return current_user


@router.put("/me", response_model=User)
async def update_user_me(
    user_update: UserUpdate, 
    current_user: User = Depends(get_current_user)
) -> Any:
    """Update current user information"""
    # Convert to dict and exclude None values
    update_data = {k: v for k, v in user_update.model_dump(exclude_unset=True).items() if v is not None}
    
    if not update_data:
        return current_user
    
    updated_user = await neo4j_service.update_user(current_user.id, update_data)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return updated_user


@router.delete("/me")
async def delete_user_me(current_user: User = Depends(get_current_user)) -> Any:
    """Delete current user account"""
    # TODO: Implement user deletion with proper cleanup of related data
    return {"message": "Delete user endpoint - to be implemented"}


@router.post("/me/unsubscribe")
async def unsubscribe_user(current_user: User = Depends(get_current_user)) -> Any:
    """Unsubscribe user from the service (deactivate account)"""
    updated_user = await neo4j_service.update_user(
        current_user.id, 
        {"account_active": False, "sms_notifications_enabled": False}
    )
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "Successfully unsubscribed from CarLog service"}


@router.post("/me/sms-opt-out")
async def sms_opt_out(current_user: User = Depends(get_current_user)) -> Any:
    """Opt out of SMS notifications only"""
    updated_user = await neo4j_service.update_user(
        current_user.id, 
        {"sms_notifications_enabled": False}
    )
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "Successfully opted out of SMS notifications"}


@router.post("/me/sms-opt-in")
async def sms_opt_in(current_user: User = Depends(get_current_user)) -> Any:
    """Opt back in to SMS notifications"""
    if not current_user.phone_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number required to enable SMS notifications"
        )
    
    updated_user = await neo4j_service.update_user(
        current_user.id, 
        {"sms_notifications_enabled": True}
    )
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "Successfully opted in to SMS notifications"}
