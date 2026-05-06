from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from app.core.database import Base

class QuizSession(Base):
    __tablename__ = "quiz_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String, nullable=True)
    session_type = Column(String, nullable=True)
    
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    total_score = Column(Float, nullable=True)
    total_questions = Column(Integer, nullable=True)
    
    user = relationship("User", back_populates="quiz_sessions")
    quiz_attempts = relationship("QuizAttempt", back_populates="session", cascade="all, delete-orphan")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    class Config:
        from_attributes = True

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id = Column(Integer, ForeignKey("quiz_sessions.id", ondelete="CASCADE"), nullable=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="SET NULL"), nullable=True, index=True)
    
    is_correct = Column(Boolean, default=False) 
    response_time = Column(Float, nullable=True) 
    skill_tag = Column(String, nullable=True)
    
    user_answer = Column(String, nullable=True)
    error_code = Column(String, ForeignKey("error_codes.code", ondelete="SET NULL"), nullable=True)
    
    user = relationship("User", back_populates="quiz_attempts")
    session = relationship("QuizSession", back_populates="quiz_attempts")
    question = relationship("Question", back_populates="quiz_attempts")
    error_detail = relationship("ErrorCode", back_populates="attempts")
    bkt_results = relationship("BKTResult", back_populates="quiz_attempt", cascade="all, delete-orphan")
    
    attempted_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    class Config:
        from_attributes = True

class StudentStats(Base):
    __tablename__ = "student_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    skill_mastery = Column(JSONB, default=dict)
    current_profile = Column(String, default="Developing (Average)")
    avg_mastery = Column(Float, default=0.0)
    
    user = relationship("User", back_populates="student_stats")
    
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)
    
    class Config:
        from_attributes = True

class BKTResult(Base):
    __tablename__ = "bkt_results"
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_attempt_id = Column(Integer, ForeignKey("quiz_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_tag = Column(String, nullable=False, index=True)
    
    p_prior = Column(Float, nullable=False)
    p_posterior = Column(Float, nullable=False)
    
    quiz_attempt = relationship("QuizAttempt", back_populates="bkt_results")
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    class Config:
        from_attributes = True

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="SET NULL"), nullable=True, index=True)
    
    reason = Column(String)
    confidence = Column(Float, default=0.0)
    
    user = relationship("User", back_populates="recommendations")
    question = relationship("Question", back_populates="recommendations")
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    class Config:
        from_attributes = True