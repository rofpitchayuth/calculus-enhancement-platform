import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.core.database import SessionLocal
from app.models.user import User

def create_test_user():
    db = SessionLocal()
    # Check if user exists
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        user = User(
            id=1,
            email="test@example.com",
            hashed_password="mock_password_hash",
            full_name="Test Student",
            is_active=True
        )
        db.add(user)
        db.commit()
        print("Test user created successfully.")
    else:
        print("Test user already exists.")
    db.close()

if __name__ == "__main__":
    create_test_user()
