#!/usr/bin/env python3
"""
Twilio SMS Test Script
Sends a test message to verify Twilio configuration
"""

import os
from datetime import datetime
from app.services.sms_service import sms_service

def test_twilio_sms():
    """Send a test SMS message to verify Twilio configuration"""
    
    # Test phone number
    test_phone = "+17039456707"
    
    # Test message
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    test_message = f"CarLog SMS Test - {current_time}\n\nTwilio integration is working correctly!"
    
    print(f"Sending test SMS to {test_phone}...")
    print(f"Message: {test_message}")
    print("-" * 50)
    
    # Send the SMS
    message_sid = sms_service.send_sms(test_phone, test_message)
    
    if message_sid:
        print(f"✅ SMS sent successfully!")
        print(f"Message SID: {message_sid}")
        print(f"Phone number: {test_phone}")
    else:
        print("❌ Failed to send SMS")
        print("Check your Twilio configuration in .env file:")
        print("- TWILIO_ACCOUNT_SID")
        print("- TWILIO_AUTH_TOKEN") 
        print("- TWILIO_PHONE_NUMBER")
    
    return message_sid is not None

if __name__ == "__main__":
    # Load environment variables if running standalone
    from dotenv import load_dotenv
    load_dotenv()
    
    success = test_twilio_sms()
    exit(0 if success else 1)