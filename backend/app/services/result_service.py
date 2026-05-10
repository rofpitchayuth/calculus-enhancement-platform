from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from app.models.result import QuizSession, QuizAttempt, StudentStats
from app.schemas.result import QuizSessionResponse

class ResultService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_sessions(self, user_id: int) -> List[QuizSession]:
        return self.db.query(QuizSession).filter(
            QuizSession.user_id == user_id,
            QuizSession.end_time.isnot(None)
        ).order_by(QuizSession.end_time.desc()).all()

    def get_session_details(self, session_id: int, user_id: int) -> dict:
        session = self.db.query(QuizSession).filter(
            QuizSession.id == session_id,
            QuizSession.user_id == user_id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz session not found"
            )
        
        attempts = self.db.query(QuizAttempt).filter(
            QuizAttempt.session_id == session_id
        ).all()
        
        return {
            "session": session,
            "attempts": attempts
        }

    def get_user_mastery(self, user_id: int, skill_id: str) -> dict:
        stats = self.db.query(StudentStats).filter(
            StudentStats.user_id == user_id
        ).first()
        
        if not stats:
            # Return default prior if no stats yet
            return {
                "user_id": user_id,
                "skill_id": skill_id,
                "mastery_probability": 0.2
            }
        
        mastery = stats.skill_mastery or {}
        p_mastery = mastery.get(skill_id, 0.2)
        
        return {
            "user_id": user_id,
            "skill_id": skill_id,
            "mastery_probability": p_mastery
        }
