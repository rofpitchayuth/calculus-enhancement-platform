from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id, get_current_admin_user_id
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse, UserResponse
from app.services.auth_service import AuthService

router = APIRouter()

@router.post("/register", response_model=AuthResponse)
async def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    """Register new user"""
    auth_service = AuthService(db)
    return await auth_service.register_user(user_data)

@router.post("/login", response_model=AuthResponse)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """Login user"""
    auth_service = AuthService(db)
    return await auth_service.login_user(login_data)

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get current user profile"""
    auth_service = AuthService(db)
    return await auth_service.get_current_user(current_user_id)

@router.get("/users", response_model=list[UserResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    admin_id: int = Depends(get_current_admin_user_id),
    db: Session = Depends(get_db)
):
    """Get all users (admin only via RBAC dependency)"""
    auth_service = AuthService(db)
    return await auth_service.get_all_users(skip=skip, limit=limit)