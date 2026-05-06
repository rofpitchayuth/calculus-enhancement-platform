from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime
from app.models.question import MainTopic

class QuizStartRequest(BaseModel):
    user_id: int
    topic: Optional[MainTopic] = None
    num_questions: int = Field(default=5, ge=1, le=20)

class QuizSubmitAnswerRequest(BaseModel):
    user_id: int
    session_id: int
    question_id: int
    user_answer: str # "A", "B", "C", etc.
    skill_id: MainTopic = Field(..., description="Main skill for this question (e.g., 'LIMIT', 'DIFFERENTIAL')")
    response_latency: float = Field(0.0, description="Time taken to answer in seconds")

class QuestionResponse(BaseModel):
    id: int
    question_text: str
    choices: Optional[List[dict]] = None
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
    error_code: str = Field(..., description="Pre-computed error code for the selected choice")
    feedback_text: str = Field(..., description="Pre-computed step-by-step analysis for this question")
    p_mastery_before: float = Field(..., description="Mastery probability before this answer")
    p_mastery_after: float = Field(..., description="Updated mastery probability")
    p_correct_next: float = Field(..., description="Predicted probability of getting next question correct")

class QuizEndRequest(BaseModel):
    user_id: int
    session_id: int

class QuizEndResponse(BaseModel):
    session_id: int
    total_score: float
    total_questions: int
    start_time: datetime
    end_time: datetime
    session_summary: List[Any] = Field(default_factory=list, description="Summary of all questions attempted in this session for the review page")
    # AI profile fields populated by the KT microservice.
    # These are Optional: if the ML service is unavailable they will be null
    # in the JSON response instead of causing the endpoint to fail.
    student_profile: Optional[str] = Field(
        None,
        description="AI-generated student profile label (e.g. 'High Achiever', 'Struggling')"
    )
    skill_mastery: Optional[float] = Field(
        None,
        description="Average predicted mastery probability (0.0–1.0) from the DKT-GRU model"
    )

