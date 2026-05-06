from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.services.result_service import ResultService
from app.schemas.result import QuizSessionResponse, QuizAttemptResponse

router = APIRouter()

@router.get("/me", response_model=List[QuizSessionResponse])
def get_my_sessions(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Retrieve all completed quiz sessions for current user (history)."""
    service = ResultService(db)
    return service.get_user_sessions(current_user_id)

@router.get("/sessions/{session_id}")
def get_session_details(
    session_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Retrieve complete details for a specific session."""
    service = ResultService(db)
    return service.get_session_details(session_id, current_user_id)

@router.get("/mastery/{skill_id}")
def get_my_mastery(
    skill_id: str,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Retrieve current user's mastery level for a specific skill."""
    service = ResultService(db)
    return service.get_user_mastery(current_user_id, skill_id)
