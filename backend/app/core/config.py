from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, model_validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "CarLog"
    API_V1_STR: str = "/api/v1"

    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    BACKEND_CORS_ORIGINS: Union[str, List[str]] = Field(default="http://localhost:3000")

    @model_validator(mode="after")
    def parse_cors_origins(self) -> "Settings":
        cors_value = self.BACKEND_CORS_ORIGINS
        if isinstance(cors_value, str):
            # Handle comma-separated string
            if "," in cors_value:
                parsed_origins = [i.strip() for i in cors_value.split(",") if i.strip()]
            # Handle single URL string
            elif cors_value.strip():
                parsed_origins = [cors_value.strip()]
            # Handle empty string
            else:
                parsed_origins = ["http://localhost:3000"]
            self.BACKEND_CORS_ORIGINS = parsed_origins
        elif isinstance(cors_value, list):
            self.BACKEND_CORS_ORIGINS = cors_value
        return self

    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = ""  # Empty string for no authentication

    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""

    # CarAPI Configuration
    CARAPI_TOKEN: str = ""
    CARAPI_SECRET: str = ""
    CARAPI_BASE_URL: str = "https://carapi.app/api"

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")


settings = Settings()
