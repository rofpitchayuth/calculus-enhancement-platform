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
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()