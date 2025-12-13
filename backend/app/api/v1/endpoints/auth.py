from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse, UserResponse
from app.services.auth_service import AuthService

router = APIRouter()

@router.post("/register", response_model=AuthResponse)
async def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):
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
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    from repositories.user_repository import UserRepository
    
    user_repo = UserRepository(db)
    current_user = user_repo.get_user_by_id(current_user_id)
    
    # Check if user is admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    users = user_repo.get_all_users(skip=skip, limit=limit)
    return [UserResponse.model_validate(user) for user in users]