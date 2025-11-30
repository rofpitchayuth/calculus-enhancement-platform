from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.security import verify_token
from ..repositories.user_repository import UserRepository
from ..services.auth_service import AuthService
from ..schemas.auth import UserResponse

security = HTTPBearer()

def get_user_repository(db: Annotated[Session, Depends(get_db)]) -> UserRepository:
    return UserRepository(db)

def get_auth_service(user_repo: Annotated[UserRepository, Depends(get_user_repository)]) -> AuthService:
    return AuthService(user_repo)

async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)]
) -> UserResponse:
    token = credentials.credentials
    user_id = verify_token(token)
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await auth_service.get_current_user(int(user_id))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    
    return user