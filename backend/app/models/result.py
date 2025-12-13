from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from app.core.database import Base

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, nullable=True)  # Legacy field, can be NULL
    
    is_correct = Column(Boolean, default=False) 
    difficulty = Column(String, nullable=True)
    response_time = Column(Float, nullable=True) 
    skill_tag = Column(String, nullable=True)
    
    user_answer = Column(String, nullable=True)
    
    user = relationship("User", back_populates="quiz_attempts")
    ibkt_results = relationship("IBKTResult", back_populates="quiz_attempt", cascade="all, delete-orphan")
    
    attempted_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    class Config:
        from_attributes = True

class StudentKnowledge(Base):
    __tablename__ = "student_knowledge"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    skill_mastery = Column(JSONB, default=dict)
    
    user = relationship("User", back_populates="student_knowledge")
    
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)
    
    class Config:
        from_attributes = True

class IBKTResult(Base):
    __tablename__ = "ibkt_results"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    quiz_attempt_id = Column(Integer, ForeignKey("quiz_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_tag = Column(String, nullable=False)
    
    p_prior = Column(Float, nullable=False)
    p_posterior = Column(Float, nullable=False)
    
    quiz_attempt = relationship("QuizAttempt", back_populates="ibkt_results")
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    class Config:
        from_attributes = True

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, nullable=True)
    
    reason = Column(String)
    confidence = Column(Float, default=0.0)
    
    user = relationship("User", back_populates="recommendations")
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    class Config:
        from_attributes = True