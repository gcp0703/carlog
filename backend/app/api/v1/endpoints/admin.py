from fastapi import APIRouter, HTTPException, Depends
from app.api.dependencies import get_current_active_user
from app.models.user import User
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