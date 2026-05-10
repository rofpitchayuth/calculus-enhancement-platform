from pydantic import BaseModel
from typing import Dict, Optional
from datetime import datetime

class StudentStatsResponse(BaseModel):
    id: int
    user_id: int
    skill_mastery: Dict[str, float]
    current_profile: str
    avg_mastery: float
    last_updated: datetime
    
    class Config:
        from_attributes = True

class QuizSessionResponse(BaseModel):
    id: int
    user_id: int
    title: Optional[str] = None
    session_type: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    total_score: Optional[float] = None
    total_questions: Optional[int] = None
    
    class Config:
        from_attributes = True

class QuizAttemptResponse(BaseModel):
    id: int
    user_id: int
    session_id: Optional[int] = None
    question_id: Optional[int] = None
    is_correct: bool
    response_time: Optional[float] = None
    skill_tag: Optional[str] = None
    user_answer: Optional[str] = None
    error_code: Optional[str] = None
    attempted_at: datetime
    
    class Config:
        from_attributes = True

class BKTResultResponse(BaseModel):
    id: int
    quiz_attempt_id: int
    skill_tag: str
    p_prior: float
    p_posterior: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class RecommendationResponse(BaseModel):
    id: int
    user_id: int
    question_id: Optional[int] = None
    reason: Optional[str] = None
    confidence: float
    created_at: datetime
    
    class Config:
        from_attributes = True