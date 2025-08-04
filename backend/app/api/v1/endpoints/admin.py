from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.api.dependencies import get_current_active_user, get_neo4j_service
from app.models.user import User, UserWithVehicleCount
from app.services.neo4j_service import Neo4jService
from app.cron_scheduler import run_manual_reminder_check
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/trigger-reminders")
async def trigger_reminders(
    current_user: User = Depends(get_current_active_user)
):
    """
    Manually trigger the reminder check process.
    Only accessible to authenticated users for testing purposes.
    """
    try:
        logger.info(f"User {current_user.id} triggered manual reminder check")
        sms_count, maintenance_count = await run_manual_reminder_check()
        
        return {
            "status": "success",
            "sms_reminders_sent": sms_count,
            "maintenance_notifications_sent": maintenance_count,
            "triggered_by": current_user.email
        }
        
    except Exception as e:
        logger.error(f"Error triggering reminders: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to trigger reminders: {str(e)}"
        )


def check_admin_role(current_user: User = Depends(get_current_active_user)) -> User:
    """Check if the current user has admin role"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Not authorized. Admin role required."
        )
    return current_user


@router.get("/users", response_model=List[UserWithVehicleCount])
async def list_users(
    current_admin: User = Depends(check_admin_role),
    neo4j_service: Neo4jService = Depends(get_neo4j_service)
):
    """
    Get all users with their vehicle counts.
    Only accessible to admin users.
    """
    try:
        logger.info(f"Admin {current_admin.id} listing all users")
        users_data = await neo4j_service.get_all_users_with_vehicle_count()
        
        # Convert to UserWithVehicleCount objects
        users = []
        for user_data in users_data:
            users.append(UserWithVehicleCount(**user_data))
        
        return users
        
    except Exception as e:
        logger.error(f"Error listing users: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve users: {str(e)}"
        )