from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from app.core.database import Base

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    
    question_text = Column(Text, nullable=False)
    content_json = Column(JSONB, nullable=True)
    correct_answer = Column(String, nullable=False)
    choices = Column(JSONB, nullable=True)
    
    difficulty = Column(Float, default=0.5)
    discrimination = Column(Float, default=1.0) 
    guessing = Column(Float, default=0.0)
    
    bloom_level = Column(String, nullable=True)
    main_topic = Column(String, index=True, nullable=True) 
    sub_topic = Column(String, nullable=True)
    skill_tags = Column(JSONB, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    class Config:
        from_attributes = True
