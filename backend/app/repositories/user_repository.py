from typing import Optional
from sqlalchemy.orm import Session
from .base import BaseRepository
from ..models.user import User, UserRole

class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(self.model).filter(self.model.email == email).first()

    def create_user(self, email: str, hashed_password: str, full_name: str, role: UserRole) -> User:
        user_data = {
            "email": email,
            "hashed_password": hashed_password,
            "full_name": full_name,
            "role": role
        }
        return self.create(user_data)

    def get_active_users(self) -> list[User]:
        return self.db.query(self.model).filter(self.model.is_active == True).all()