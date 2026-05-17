from pydantic_settings import BaseSettings
from pydantic import Field, ConfigDict
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = Field(
        default="postgresql://postgres:rofpun@localhost:5432/calculus_db"
    )

    SECRET_KEY: str = Field(
        default="your-super-secret-key-minimum-32-characters-long-for-jwt-security"
    )

    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=1440)
    ALGORITHM: str = Field(default="HS256")
    PROJECT_NAME: str = Field(default="Calculus Enhancement Platform")
    API_V1_STR: str = "/api/v1"

    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:3000,http://localhost:5173"
    )

    KT_SERVICE_URL: str = Field(default="http://localhost:8001")
    LLM_SERVICE_URL: str = Field(default="http://localhost:8002")

    HF_TOKEN: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None

    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()