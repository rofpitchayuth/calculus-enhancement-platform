from typing import Optional
from datetime import timedelta

from ..core.security import verify_password, get_password_hash, create_access_token
from ..core.exceptions import AuthenticationError, UserAlreadyExistsError
from ..repositories.user_repository import UserRepository
from ..schemas.auth import LoginResponse, UserResponse, Token
from ..models.user import User, UserRole

class AuthService:
    def __init__(self, user_repository: UserRepository):
        self.user_repo = user_repository

    async def authenticate_user(self, email: str, password: str) -> LoginResponse:
        """ตรวจสอบการล็อกอิน"""
        user = self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise AuthenticationError("Invalid email or password")
        
        if not user.is_active:
            raise AuthenticationError("Account is disabled")

        # สร้าง token
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email}
        )

        return LoginResponse(
            user=UserResponse.model_validate(user),
            token=Token(access_token=access_token, token_type="bearer")
        )

    async def create_user(self, email: str, password: str, full_name: str, role: UserRole) -> LoginResponse:
        """สร้างผู้ใช้ใหม่"""
        existing_user = self.user_repo.get_by_email(email)
        if existing_user:
            raise UserAlreadyExistsError("Email already registered")

        hashed_password = get_password_hash(password)
        user = self.user_repo.create_user(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            role=role
        )

        # สร้าง token
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email}
        )

        return LoginResponse(
            user=UserResponse.model_validate(user),
            token=Token(access_token=access_token, token_type="bearer")
        )

    async def get_current_user(self, user_id: int) -> Optional[UserResponse]:
        """ดึงข้อมูลผู้ใช้ปัจจุบัน"""
        user = self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            return None
        return UserResponse.model_validate(user)