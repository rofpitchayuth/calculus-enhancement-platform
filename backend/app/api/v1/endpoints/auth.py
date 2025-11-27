from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ....core.database import get_db
from ....services.auth_service import AuthService
from ....repositories.user_repository import UserRepository
from ....schemas.auth import LoginRequest, RegisterRequest, LoginResponse, UserResponse
from ....api.deps import get_auth_service, get_current_user

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
async def login(
    login_data: LoginRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)]
):
    """Login endpoint"""
    return await auth_service.authenticate_user(
        email=login_data.email,
        password=login_data.password
    )

@router.post("/register", response_model=LoginResponse)
async def register(
    register_data: RegisterRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)]
):
    """Register endpoint"""
    return await auth_service.create_user(
        email=register_data.email,
        password=register_data.password,
        full_name=register_data.full_name,
        role=register_data.role
    )

@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: Annotated[UserResponse, Depends(get_current_user)]
):
    """Get current user info"""
    return current_user