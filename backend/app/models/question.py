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
    # Limits and Continuity
    LIMIT_LAWS = "limit_laws"
    EVALUATING_LIMITS = "evaluating_limits"
    ALGEBRAIC_LIMITS = "algebraic_limits"
    LIMITS_INFINITY = "limits_at_infinity"
    TRIG_LIMITS = "trigonometric_limits"
    CONTINUITY = "continuity"

    # Derivatives
    DEF_DERIVATIVE = "definition_of_derivative"
    DERIVATIVE_RULES = "derivative_rules"
    PRODUCT_RULE = "product_rule"
    CHAIN_RULE = "chain_rule"
    ADV_DERIVATIVE_RULES = "advanced_derivative_rules"
    IMPLICIT_DIFF = "implicit_differentiation"
    IMPLICIT_FUNCTIONS = "implicit_functions"
    SECOND_DERIVATIVE = "second_derivative"
    HIGHER_ORDER_DERIV = "higher_order_derivatives"

    # Applications of Derivatives
    APP_OF_DERIVATIVES = "applications_of_derivatives"
    CURVE_SKETCHING = "curve_sketching_analysis"
    OPTIMIZATION = "optimization"
    RELATED_RATES = "related_rates"
    KINEMATICS = "kinematics"

    # Integrals and Techniques
    INDEFINITE_INTEGRALS = "indefinite_integrals"
    DEFINITE_INTEGRALS = "definite_integrals"
    INTEGRATION_TECHNIQUES = "integration_techniques"
    SUBSTITUTION = "substitution_and_techniques"
    INTEGRATION_BY_PARTS = "integration_by_parts"
    ADV_INTEGRATION = "advanced_integration"

    # Applications of Integration
    AREA_VOLUME = "area_and_volume"

    # Functions and Miscellaneous
    TRIG_FUNCTIONS = "trigonometric_functions"
    TRIG_IDENTITIES = "trig_identities"
    INVERSE_FUNCTIONS = "inverse_functions"
    APPLICATIONS = "applications"
    OTHER = "other"

import enum

class SkillTag(str, enum.Enum):
    # Algebraic and Pre-calculus skills used in simplification
    DIRECT_SUBSTITUTION = "direct_substitution"
    FACTORING_AND_CANCELING = "factoring_and_canceling"
    CONJUGATE_METHOD = "conjugate_method"
    ALGEBRAIC_MANIPULATION = "algebraic_manipulation"
    COMPOSITE_FUNCTIONS = "composite_functions"
    FACTORING_POLYNOMIALS = "factoring_polynomials"
    EVALUATING_FUNCTIONS = "evaluating_functions"
    LOGARITHM_PROPERTIES = "logarithm_properties"
    SOLVING_INEQUALITIES = "solving_inequalities"
    RATIONALIZING_DENOMINATORS = "rationalizing_denominators"

    # Specific techniques for solving limits
    SPECIAL_TRIG_LIMITS = "special_trig_limits"
    LHOPITALS_RULE = "lhopitals_rule"

    # Core differentiation rules and techniques
    POWER_RULE = "power_rule"
    PRODUCT_RULE = "product_rule"
    QUOTIENT_RULE = "quotient_rule"
    CHAIN_RULE = "chain_rule"
    TRIG_DERIVATIVES = "trig_derivatives"
    EXPONENTIAL_LOG_DERIVATIVES = "exponential_log_derivatives"
    IMPLICIT_DIFFERENTIATION = "implicit_differentiation"
    SECOND_DERIVATIVE = "second_derivative"

    # Skills for applying derivatives to problems
    FIRST_DERIVATIVE_TEST = "first_derivative_test"
    SECOND_DERIVATIVE_TEST = "second_derivative_test"
    SETTING_UP_OPTIMIZATION = "setting_up_optimization"
    RELATED_RATES = "related_rates"
    CURVE_SKETCHING_ANALYSIS = "curve_sketching_analysis"

    # Core integration techniques and evaluations
    POWER_RULE_INTEGRATION = "power_rule_integration"
    U_SUBSTITUTION = "u_substitution"
    INTEGRATION_BY_PARTS = "integration_by_parts"
    PARTIAL_FRACTIONS = "partial_fractions"
    FTC_EVALUATION = "ftc_evaluation"
    SETTING_UP_AREA_INTEGRAL = "setting_up_area_integral"

    # Fallback skills
    OTHER_PRE_CALCULUS_SKILL = "other_pre_calculus_skill"
    OTHER_CALCULUS_SKILL = "other_calculus_skill"

    
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
