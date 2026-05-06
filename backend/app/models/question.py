import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from app.core.database import Base

class MainTopic(str, enum.Enum):
    LIMIT = "LIMIT"
    DIFFERENTIAL = "DIFFERENTIAL"
    INTEGRAL = "INTEGRAL"
    APPLICATIONS = "APPLICATIONS"

class SubTopic(str, enum.Enum):
    # Existing/New
    LIMIT_LAWS = "limit_laws"
    CONTINUITY = "continuity"
    DERIVATIVE_RULES = "derivative_rules"
    INTEGRATION_BY_PARTS = "integration_by_parts"
    OTHER = "other"
    
    # From database values
    CURVE_SKETCHING = "curve_sketching_analysis"
    ADV_DERIVATIVE_RULES = "advanced_derivative_rules"
    INDEFINITE_INTEGRALS = "indefinite_integrals"
    APPLICATIONS = "applications"
    AREA_VOLUME = "area_and_volume"
    PRODUCT_RULE = "product_rule"
    CHAIN_RULE = "chain_rule"
    DEF_DERIVATIVE = "definition_of_derivative"
    EVALUATING_LIMITS = "evaluating_limits"
    SECOND_DERIVATIVE = "second_derivative"
    KINEMATICS = "kinematics"
    DEFINITE_INTEGRALS = "definite_integrals"
    INVERSE_FUNCTIONS = "inverse_functions"
    LIMITS_INFINITY = "limits_at_infinity"

class ErrorCode(Base):
    __tablename__ = "error_codes"
    
    code = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    explanation = Column(Text, nullable=True)
    default_feedback = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    attempts = relationship("QuizAttempt", back_populates="error_detail")
    
    class Config:
        from_attributes = True

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    
    question_text = Column(Text, nullable=False)
    content_json = Column(JSONB, nullable=True)
    correct_answer = Column(String, nullable=False)
    choices = Column(JSONB, nullable=True)
    
    difficulty = Column(Float, default=0.5, index=True)
    discrimination = Column(Float, default=1.0) 
    
    bloom_level = Column(String, nullable=True, index=True)
    main_topic = Column(Enum(MainTopic), index=True, nullable=True) 
    sub_topic = Column(Enum(SubTopic), nullable=True)
    skill_tags = Column(JSONB, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    quiz_attempts = relationship("QuizAttempt", back_populates="question")
    recommendations = relationship("Recommendation", back_populates="question")
    
    class Config:
        from_attributes = True
