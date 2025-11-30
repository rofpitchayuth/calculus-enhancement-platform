from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
from models.user import UserRole

# Request schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(max_length=70, description="Password max 70 characters")

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=70, description="Password 6-70 characters")
    fullName: str = Field(min_length=1, max_length=100)
    role: UserRole = UserRole.STUDENT
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password cannot be longer than 72 bytes')
        return v

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class UserResponse(BaseModel):
    id: int
    email: str
    fullName: str
    role: UserRole
    is_active: bool
    is_verified: bool 
    created_at: datetime

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    user: UserResponse
    token: Token

LoginResponse = AuthResponse
TokenResponse = Token