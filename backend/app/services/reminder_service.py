import logging
from datetime import datetime, date, timedelta
from typing import List, Optional, Tuple
from calendar import monthrange

from app.services.neo4j_service import Neo4jService
from app.services.sms_service import SMSService
from app.models.user import User


logger = logging.getLogger(__name__)


class ReminderService:
    """Service for handling scheduled reminders"""
    
    def __init__(self, neo4j_service: Neo4jService, sms_service: SMSService):
        self.neo4j_service = neo4j_service
        self.sms_service = sms_service
        self.logger = logger
    
    def should_send_sms_reminder(self, user: User, current_date: date) -> bool:
        """Check if user should receive SMS reminder based on their frequency setting"""
        if not user.sms_notifications_enabled or not user.phone_number:
            return False
        
        # If never sent before, send now
        if not user.last_update_request:
            return True
        
        last_sent = user.last_update_request.date()
        
        if user.sms_notification_frequency == "weekly":
            # Send on Saturdays
            if current_date.weekday() == 5:  # Saturday
                # Check if we haven't sent this week
                days_since_last = (current_date - last_sent).days
                return days_since_last >= 7
                
        elif user.sms_notification_frequency == "monthly":
            # Send on 1st of month
            if current_date.day == 1:
                # Check if we haven't sent this month
                return last_sent.month != current_date.month or last_sent.year != current_date.year
                
        elif user.sms_notification_frequency == "quarterly":
            # Send on 1st of Jan, Apr, Jul, Oct
            if current_date.day == 1 and current_date.month in [1, 4, 7, 10]:
                # Check if we haven't sent this quarter
                last_quarter = (last_sent.month - 1) // 3
                current_quarter = (current_date.month - 1) // 3
                return last_quarter != current_quarter or last_sent.year != current_date.year
        
        return False
    
    def should_send_maintenance_notification(self, user: User, current_date: date) -> bool:
        """Check if user should receive maintenance notification based on their frequency setting"""
        if not user.email_notifications_enabled and not user.sms_notifications_enabled:
            return False
        
        # If never sent before, send now
        if not user.last_maintenance_notification:
            return True
        
        last_sent = user.last_maintenance_notification.date()
        
        if user.maintenance_notification_frequency == "monthly":
            # Send on 1st of month
            if current_date.day == 1:
                return last_sent.month != current_date.month or last_sent.year != current_date.year
                
        elif user.maintenance_notification_frequency == "quarterly":
            # Send on 1st of Jan, Apr, Jul, Oct
            if current_date.day == 1 and current_date.month in [1, 4, 7, 10]:
                last_quarter = (last_sent.month - 1) // 3
                current_quarter = (current_date.month - 1) // 3
                return last_quarter != current_quarter or last_sent.year != current_date.year
                
        elif user.maintenance_notification_frequency == "annually":
            # Send on Jan 1st
            if current_date.month == 1 and current_date.day == 1:
                return last_sent.year != current_date.year
        
        return False
    
    async def send_sms_reminder(self, user: User) -> bool:
        """Send SMS reminder to user asking for mileage update"""
        try:
            if not user.phone_number:
                self.logger.warning(f"User {user.id} has no phone number for SMS reminder")
                return False
            
            # Get user's vehicles for personalized message
            vehicles = await self.neo4j_service.get_user_vehicles(user.id)
            
            if not vehicles:
                message = "Hi! It's time for your CarLog update. You don't have any vehicles registered yet. Add a vehicle at carlog.piprivate.net to start tracking maintenance!"
            elif len(vehicles) == 1:
                vehicle = vehicles[0]
                message = f"Hi! Time for your CarLog update. What's the current mileage on your {vehicle.year} {vehicle.brand} {vehicle.model}? Reply with just the number."
            else:
                message = f"Hi! Time for your CarLog update. Reply with your current mileage for any of your {len(vehicles)} vehicles. Include vehicle name if you have multiple."
            
            # Send SMS
            success = self.sms_service.send_sms(user.phone_number, message)
            
            if success:
                # Update last_update_request timestamp
                await self.neo4j_service.update_user(
                    user.id,
                    {"last_update_request": datetime.utcnow()}
                )
                self.logger.info(f"Sent SMS reminder to user {user.id}")
            
            return success
            
        except Exception as e:
            self.logger.error(f"Error sending SMS reminder to user {user.id}: {e}")
            return False
    
    async def send_maintenance_notification(self, user: User) -> bool:
        """Send maintenance notification via email and/or SMS based on user preferences"""
        try:
            # Get user's vehicles
            vehicles = await self.neo4j_service.get_user_vehicles(user.id)
            
            if not vehicles:
                self.logger.info(f"User {user.id} has no vehicles for maintenance notification")
                return False
            
            # TODO: Generate maintenance recommendations
            # For now, send a basic notification
            
            success = False
            
            # Send SMS if enabled
            if user.sms_notifications_enabled and user.phone_number:
                message = f"CarLog Maintenance Alert: Check your maintenance schedule at carlog.piprivate.net. You have {len(vehicles)} vehicle(s) that may need service soon."
                sms_success = self.sms_service.send_sms(user.phone_number, message)
                if sms_success:
                    success = True
            
            # TODO: Send email if enabled
            if user.email_notifications_enabled:
                # Email implementation would go here
                pass
            
            if success:
                # Update last_maintenance_notification timestamp
                await self.neo4j_service.update_user(
                    user.id,
                    {"last_maintenance_notification": datetime.utcnow()}
                )
                self.logger.info(f"Sent maintenance notification to user {user.id}")
            
            return success
            
        except Exception as e:
            self.logger.error(f"Error sending maintenance notification to user {user.id}: {e}")
            return False
    
    async def process_scheduled_reminders(self, current_date: Optional[date] = None) -> Tuple[int, int]:
        """Process all scheduled reminders for the given date"""
        if current_date is None:
            current_date = date.today()
        
        self.logger.info(f"Processing scheduled reminders for {current_date}")
        
        sms_count = 0
        maintenance_count = 0
        
        try:
            # Get all active users
            users = await self.neo4j_service.get_all_active_users()
            
            for user in users:
                # Check and send SMS reminders
                if self.should_send_sms_reminder(user, current_date):
                    if await self.send_sms_reminder(user):
                        sms_count += 1
                
                # Check and send maintenance notifications
                if self.should_send_maintenance_notification(user, current_date):
                    if await self.send_maintenance_notification(user):
                        maintenance_count += 1
            
            self.logger.info(
                f"Processed reminders: {sms_count} SMS reminders, "
                f"{maintenance_count} maintenance notifications"
            )
            
        except Exception as e:
            self.logger.error(f"Error processing scheduled reminders: {e}")
        
        return sms_count, maintenance_count