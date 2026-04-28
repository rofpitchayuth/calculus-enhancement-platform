from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class MainTopicEnum(str, Enum):
    derivatives = "derivatives"
    integrals = "integrals"
    limits_and_continuity = "limits_and_continuity"
    applications = "applications"

class BloomLevelEnum(str, Enum):
    remembering = "Remembering"
    understanding = "Understanding"
    applying = "Applying"
    analyzing = "Analyzing"
    evaluating = "Evaluating"
    creating = "Creating"

class QuestionDraftRequest(BaseModel):
    question_text: str
    choice_a: str
    choice_b: str
    choice_c: str
    choice_d: str
    choice_e: str

class QuestionAnalysisResponse(BaseModel):
    step_by_step_analysis: str
    main_topic: str
    sub_topic: str
    skill_tags: List[str]
    bloom_level: str
    difficulty: float
    discrimination: float
    error_code_A: str
    error_code_B: str
    error_code_C: str
    error_code_D: str
    error_code_E: str

class QuestionSaveRequest(BaseModel):
    question_text: str
    choices: dict # {"A": "...", "B": "...", ...}
    correct_answer: str # "A", "B", ...
    main_topic: str
    sub_topic: str
    bloom_level: str
    difficulty: float
    discrimination: float
    skill_tags: List[str]
    # content_json can store the step_by_step_analysis or mapping
    content_json: Optional[dict] = None
