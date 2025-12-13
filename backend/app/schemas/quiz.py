from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class QuizStartRequest(BaseModel):
    user_id: int
    topic: Optional[str] = None
    num_questions: int = Field(default=5, ge=1, le=20)

class QuizSubmitAnswerRequest(BaseModel):
    user_id: int
    question_id: int
    user_answer: str
    skill_id: str = Field(..., description="Main skill for this question (e.g., 'limits', 'derivatives')")

class QuestionResponse(BaseModel):
    id: int
    question_text: str
    choices: Optional[List[str]] = None
    bloom_level: Optional[str]
    skill_id: str
    
    class Config:
        from_attributes = True

class QuizStartResponse(BaseModel):
    session_id: int
    questions: List[QuestionResponse]
    total_questions: int

class QuizSubmitResponse(BaseModel):
    is_correct: bool
    correct_answer: str
    p_mastery_before: float = Field(..., description="Mastery probability before this answer")
    p_mastery_after: float = Field(..., description="Updated mastery probability")
    p_correct_next: float = Field(..., description="Predicted probability of getting next question correct")
