from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.models.question import MainTopic

class QuestionBase(BaseModel):
    question_text: str
    choices: Optional[Dict[str, Any]] = None
    difficulty: float = Field(default=0.5, ge=0, le=1)
    bloom_level: Optional[str] = None
    main_topic: Optional[MainTopic] = None
    sub_topic: Optional[str] = None
    skill_tags: Optional[List[str]] = None

class QuestionCreate(QuestionBase):
    correct_answer: str

class Question(QuestionBase):
    id: int

    class Config:
        from_attributes = True
