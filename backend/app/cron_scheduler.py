import asyncio
import logging
from datetime import datetime, time
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.services.neo4j_service import Neo4jService
from app.services.sms_service import SMSService
from app.services.reminder_service import ReminderService
from app.core.config import settings


logger = logging.getLogger(__name__)


class CronScheduler:
    """Manages scheduled tasks for the application"""
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.logger = logger
        
    def start(self):
        """Start the scheduler"""
        try:
            # Initialize services
            neo4j_service = Neo4jService()
            sms_service = SMSService()
            reminder_service = ReminderService(neo4j_service, sms_service)
            
            # Schedule daily reminder check at 9 AM
            self.scheduler.add_job(
                self._run_reminder_check,
                CronTrigger(hour=9, minute=0),  # 9:00 AM daily
                args=[reminder_service],
                id="daily_reminder_check",
                name="Daily reminder check",
                replace_existing=True
            )
            
            # Start the scheduler
            self.scheduler.start()
            self.logger.info("Cron scheduler started successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to start cron scheduler: {e}")
            raise
    
    def stop(self):
        """Stop the scheduler"""
        try:
            self.scheduler.shutdown(wait=True)
            self.logger.info("Cron scheduler stopped")
        except Exception as e:
            self.logger.error(f"Error stopping cron scheduler: {e}")
    
    async def _run_reminder_check(self, reminder_service: ReminderService):
        """Run the daily reminder check"""
        try:
            self.logger.info("Starting daily reminder check")
            sms_count, maintenance_count = await reminder_service.process_scheduled_reminders()
            self.logger.info(
                f"Daily reminder check completed: "
                f"{sms_count} SMS reminders, {maintenance_count} maintenance notifications sent"
            )
        except Exception as e:
            self.logger.error(f"Error in daily reminder check: {e}")


# Global scheduler instance
scheduler = CronScheduler()


async def run_manual_reminder_check():
    """Run a manual reminder check - useful for testing"""
    try:
        neo4j_service = Neo4jService()
        sms_service = SMSService()
        reminder_service = ReminderService(neo4j_service, sms_service)
        
        logger.info("Running manual reminder check")
        sms_count, maintenance_count = await reminder_service.process_scheduled_reminders()
        logger.info(
            f"Manual reminder check completed: "
            f"{sms_count} SMS reminders, {maintenance_count} maintenance notifications sent"
        )
        return sms_count, maintenance_count
        
    except Exception as e:
        logger.error(f"Error in manual reminder check: {e}")
        raise