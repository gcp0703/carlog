from twilio.rest import Client
from typing import Optional

from app.core.config import settings


class SMSService:
    def __init__(self):
        self.client = None
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    
    def send_sms(self, to_number: str, message: str) -> Optional[str]:
        if not self.client:
            return None
            
        try:
            message = self.client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=to_number
            )
            return message.sid
        except Exception as e:
            # TODO: Add proper logging
            print(f"Failed to send SMS: {e}")
            return None
    
    def parse_maintenance_message(self, message: str) -> dict:
        # TODO: Implement natural language parsing for maintenance updates
        # Example: "oil change at 45000 on 1/15"
        return {
            "type": "unknown",
            "data": {}
        }


sms_service = SMSService()