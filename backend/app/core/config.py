from pydantic_settings import BaseSettings
from pydantic import Field
import os

class Settings(BaseSettings):
    DATABASE_URL: str = Field(default="postgresql://postgres:rofpun@localhost:5432/calculus_db")
    SECRET_KEY: str = Field(default="your-super-secret-key-minimum-32-characters-long-for-jwt-security")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    ALGORITHM: str = Field(default="HS256")
    PROJECT_NAME: str = Field(default="Calculus Enhancement Platform")
    API_V1_STR: str = "/api/v1"

    # CORS configuration - reads a comma-separated list from .env
    ALLOWED_ORIGINS: str = Field(default="http://localhost:3000,http://localhost:5173")

    # URL of the KT (Knowledge Tracing) ML microservice.
    # Overridden by KT_SERVICE_URL in .env; defaults to local dev port.
    KT_SERVICE_URL: str = Field(default="http://localhost:8002")
    
    # URL of the LLM Classifier microservice.
    LLM_SERVICE_URL: str = Field(default="http://localhost:8001")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

settings = Settings()