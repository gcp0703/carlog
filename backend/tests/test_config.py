"""Tests for configuration parsing and validation."""

import pytest
import os
from typing import List
from app.core.config import Settings


class TestCORSConfiguration:
    """Test CORS origins configuration parsing."""

    def test_cors_single_origin(self):
        """Test parsing single CORS origin."""
        # Save original env var if it exists
        original = os.environ.get("BACKEND_CORS_ORIGINS")
        
        try:
            os.environ["BACKEND_CORS_ORIGINS"] = "http://localhost:3000"
            settings = Settings()
            assert settings.BACKEND_CORS_ORIGINS == ["http://localhost:3000"]
            assert isinstance(settings.BACKEND_CORS_ORIGINS, list)
        finally:
            # Restore original env var
            if original is not None:
                os.environ["BACKEND_CORS_ORIGINS"] = original
            elif "BACKEND_CORS_ORIGINS" in os.environ:
                del os.environ["BACKEND_CORS_ORIGINS"]

    def test_cors_multiple_origins(self):
        """Test parsing multiple CORS origins."""
        original = os.environ.get("BACKEND_CORS_ORIGINS")
        
        try:
            os.environ["BACKEND_CORS_ORIGINS"] = "http://localhost:3000,http://localhost:8000,https://myapp.com"
            settings = Settings()
            expected = ["http://localhost:3000", "http://localhost:8000", "https://myapp.com"]
            assert settings.BACKEND_CORS_ORIGINS == expected
            assert isinstance(settings.BACKEND_CORS_ORIGINS, list)
        finally:
            if original is not None:
                os.environ["BACKEND_CORS_ORIGINS"] = original
            elif "BACKEND_CORS_ORIGINS" in os.environ:
                del os.environ["BACKEND_CORS_ORIGINS"]

    def test_cors_origins_with_spaces(self):
        """Test parsing CORS origins with extra spaces."""
        original = os.environ.get("BACKEND_CORS_ORIGINS")
        
        try:
            os.environ["BACKEND_CORS_ORIGINS"] = " http://localhost:3000 , http://localhost:8000  , https://myapp.com "
            settings = Settings()
            expected = ["http://localhost:3000", "http://localhost:8000", "https://myapp.com"]
            assert settings.BACKEND_CORS_ORIGINS == expected
        finally:
            if original is not None:
                os.environ["BACKEND_CORS_ORIGINS"] = original
            elif "BACKEND_CORS_ORIGINS" in os.environ:
                del os.environ["BACKEND_CORS_ORIGINS"]

    def test_cors_empty_string(self):
        """Test parsing empty CORS origins string."""
        original = os.environ.get("BACKEND_CORS_ORIGINS")
        
        try:
            os.environ["BACKEND_CORS_ORIGINS"] = ""
            settings = Settings()
            assert settings.BACKEND_CORS_ORIGINS == ["http://localhost:3000"]  # default fallback
        finally:
            if original is not None:
                os.environ["BACKEND_CORS_ORIGINS"] = original
            elif "BACKEND_CORS_ORIGINS" in os.environ:
                del os.environ["BACKEND_CORS_ORIGINS"]

    def test_cors_default_value(self):
        """Test default CORS origins when not set in environment."""
        original = os.environ.get("BACKEND_CORS_ORIGINS")
        
        try:
            # Remove env var if it exists
            if "BACKEND_CORS_ORIGINS" in os.environ:
                del os.environ["BACKEND_CORS_ORIGINS"]
            
            # Create settings without reading .env file
            settings = Settings(_env_file=None)
            assert settings.BACKEND_CORS_ORIGINS == ["http://localhost:3000"]  # default value
        finally:
            if original is not None:
                os.environ["BACKEND_CORS_ORIGINS"] = original