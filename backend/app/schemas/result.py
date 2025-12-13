from pydantic import BaseModel
from typing import Dict
from datetime import datetime

class StudentKnowledgeResponse(BaseModel):
    id: int
    user_id: int
    skill_mastery: Dict[str, float]
    last_updated: datetime
    
    class Config:
        from_attributes = True

class IBKTResultResponse(BaseModel):
    id: int
    skill_tag: str
    p_prior: float
    p_posterior: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class RecommendationResponse(BaseModel):
    id: int
    exam_id: int
    reason: str
    confidence: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class ExamStatistics(BaseModel):
    total_attempts: int
    correct_answers: int
    accuracy: float
    average_response_time: float
    current_mastery: Dict[str, float]