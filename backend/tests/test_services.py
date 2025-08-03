"""
Tests for service classes.
"""
import pytest
from unittest.mock import Mock, patch

from app.services.sms_service import SMSService


class TestSMSService:
    """Tests for SMS service functionality."""

    def test_sms_service_init_without_credentials(self):
        """Test SMS service initialization without Twilio credentials."""
        with patch('app.services.sms_service.settings') as mock_settings:
            mock_settings.TWILIO_ACCOUNT_SID = ""
            mock_settings.TWILIO_AUTH_TOKEN = ""
            
            service = SMSService()
            assert service.client is None

    def test_sms_service_init_with_credentials(self):
        """Test SMS service initialization with Twilio credentials."""
        with patch('app.services.sms_service.settings') as mock_settings:
            mock_settings.TWILIO_ACCOUNT_SID = "test_sid"
            mock_settings.TWILIO_AUTH_TOKEN = "test_token"
            
            with patch('app.services.sms_service.Client') as mock_client:
                service = SMSService()
                assert service.client is not None
                mock_client.assert_called_once_with("test_sid", "test_token")

    def test_send_sms_without_client(self):
        """Test sending SMS when client is not initialized."""
        with patch('app.services.sms_service.settings') as mock_settings:
            mock_settings.TWILIO_ACCOUNT_SID = ""
            mock_settings.TWILIO_AUTH_TOKEN = ""
            
            service = SMSService()
            result = service.send_sms("+1234567890", "Test message")
            assert result is None

    def test_parse_maintenance_message(self):
        """Test parsing maintenance messages (placeholder implementation)."""
        service = SMSService()
        result = service.parse_maintenance_message("oil change at 45000 on 1/15")
        
        assert isinstance(result, dict)
        assert "type" in result
        assert "data" in result
        assert result["type"] == "unknown"  # Current placeholder implementation