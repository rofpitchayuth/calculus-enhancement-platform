import os
import json
import base64
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from typing import List
from enum import Enum
from dotenv import load_dotenv
import httpx
from google import genai
from google.genai import types

# Load environment variables from .env
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Unified ML Classification Service")

# Read configuration from environment
LLM_API_BASE_URL = os.getenv("LLM_API_BASE_URL", "http://localhost:11434")
MODEL_NAME = os.getenv("LLM_MODEL_NAME", "qwen2.5-math-7b-instruct")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# CORS configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173,http://localhost:8000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MainTopicEnum(str, Enum):
    LIMIT = "LIMIT"
    DIFFERENTIAL = "DIFFERENTIAL"
    INTEGRAL = "INTEGRAL"
    APPLICATIONS = "APPLICATIONS"

class SubTopicEnum(str, Enum):
    evaluating_limits = "evaluating_limits"
    limits_at_infinity = "limits_at_infinity"
    continuity = "continuity"
    definition_of_derivative = "definition_of_derivative"
    basic_derivative_rules = "basic_derivative_rules"
    advanced_derivative_rules = "advanced_derivative_rules"
    implicit_differentiation = "implicit_differentiation"
    curve_sketching_analysis = "curve_sketching_analysis"
    related_rates = "related_rates"
    indefinite_integrals = "indefinite_integrals"
    definite_integrals = "definite_integrals"
    integration_techniques = "integration_techniques"
    kinematics = "kinematics"
    optimization = "optimization"
    area_and_volume = "area_and_volume"
    algebraic_manipulation = "algebraic_manipulation"
    functions_and_graphs = "functions_and_graphs"
    trigonometry = "trigonometry"
    exponents_and_logarithms = "exponents_and_logarithms"

class SkillTagEnum(str, Enum):
    direct_substitution = "direct_substitution"
    factoring_and_canceling = "factoring_and_canceling"
    special_trig_limits = "special_trig_limits"
    conjugate_method = "conjugate_method"
    lhopitals_rule = "lhopitals_rule"
    power_rule = "power_rule"
    product_rule = "product_rule"
    quotient_rule = "quotient_rule"
    chain_rule = "chain_rule"
    trig_derivatives = "trig_derivatives"
    second_derivative = "second_derivative"
    first_derivative_test = "first_derivative_test"
    second_derivative_test = "second_derivative_test"
    setting_up_optimization = "setting_up_optimization"
    exponential_log_derivatives = "exponential_log_derivatives"
    power_rule_integration = "power_rule_integration"
    u_substitution = "u_substitution"
    integration_by_parts = "integration_by_parts"
    partial_fractions = "partial_fractions"
    ftc_evaluation = "ftc_evaluation"
    setting_up_area_integral = "setting_up_area_integral"
    composite_functions = "composite_functions"
    inverse_functions = "inverse_functions"
    factoring_polynomials = "factoring_polynomials"
    evaluating_functions = "evaluating_functions"
    logarithm_properties = "logarithm_properties"
    solving_inequalities = "solving_inequalities"
    rationalizing_denominators = "rationalizing_denominators"
    trig_identities = "trig_identities"
    other_pre_calculus_skill = "other_pre_calculus_skill"
    other_calculus_skill = "other_calculus_skill"

class BloomLevelEnum(str, Enum):
    remembering = "Remembering"
    understanding = "Understanding"
    applying = "Applying"
    analyzing = "Analyzing"
    evaluating = "Evaluating"
    creating = "Creating"

class ErrorCodeEnum(str, Enum):
    correct_answer = "correct_answer"
    sign_error = "sign_error"
    arithmetic_error = "arithmetic_error"
    fraction_operation_error = "fraction_operation_error"
    algebra_simplification_error = "algebra_simplification_error"
    forgot_chain_rule_inner = "forgot_chain_rule_inner"
    product_quotient_mixup = "product_quotient_mixup"
    derivative_instead_of_integral = "derivative_instead_of_integral"
    forgot_plus_c = "forgot_plus_c"
    wrong_u_sub_bounds = "wrong_u_sub_bounds"
    trig_sign_error = "trig_sign_error"
    composite_evaluation_error = "composite_evaluation_error"
    trig_evaluation_error = "trig_evaluation_error"
    exponent_rule_error = "exponent_rule_error"
    logarithm_rule_error = "logarithm_rule_error"
    power_rule_error = "power_rule_error"
    unclassified_error = "unclassified_error"
    conceptual_misunderstanding = "conceptual_misunderstanding"
    indeterminate_form_misconception = "indeterminate_form_misconception"
    lhopital_applied_incorrectly = "lhopital_applied_incorrectly"
    wrong_trig_derivative_sign = "wrong_trig_derivative_sign"
    constant_derivative_error = "constant_derivative_error"
    u_sub_forgot_du = "u_sub_forgot_du"
    wrong_integration_formula = "wrong_integration_formula"
    radius_squared_error = "radius_squared_error"
    wrong_curve_order_area = "wrong_curve_order_area"
    endpoint_extrema_forgotten = "endpoint_extrema_forgotten"

_MAIN_TOPICS   = ", ".join(e.value for e in MainTopicEnum)
_SUB_TOPICS    = ", ".join(e.value for e in SubTopicEnum)
_SKILL_TAGS    = ", ".join(e.value for e in SkillTagEnum)
_BLOOM_LEVELS  = ", ".join(e.value for e in BloomLevelEnum)
_ERROR_CODES   = ", ".join(e.value for e in ErrorCodeEnum)

class ImageExtractRequest(BaseModel):
    base64_image: str

class ClassifyRequest(BaseModel):
    question_text: str = Field(..., description="The calculus question text")
    choice_a: str = Field(..., description="Choice A")
    choice_b: str = Field(..., description="Choice B")
    choice_c: str = Field(..., description="Choice C")
    choice_d: str = Field(..., description="Choice D")
    choice_e: str = Field(..., description="Choice E")

class ClassifyResponse(BaseModel):
    step_by_step_analysis: str
    main_topic: MainTopicEnum
    sub_topic: SubTopicEnum
    skill_tags: List[SkillTagEnum]
    bloom_level: BloomLevelEnum
    difficulty: float
    discrimination: float
    error_code_A: ErrorCodeEnum
    error_code_B: ErrorCodeEnum
    error_code_C: ErrorCodeEnum
    error_code_D: ErrorCodeEnum
    error_code_E: ErrorCodeEnum

    @field_validator("difficulty", "discrimination", mode="before")

    @field_validator(
        "error_code_A", "error_code_B", "error_code_C", "error_code_D", "error_code_E", 
        mode="before"
    )
    @classmethod
    def validate_error_codes(cls, v):
        valid_errors = set(e.value for e in ErrorCodeEnum)
        clean_v = str(v).strip()
        if clean_v in valid_errors:
            return clean_v
        logger.warning(f"Gemini hallucinated an error code: {clean_v}. Defaulting to unclassified_error.")
        return "unclassified_error"

    @classmethod
    def clamp_to_unit_interval(cls, v):
        try:
            v = float(v)
        except (TypeError, ValueError):
            return 0.5
        return max(0.0, min(1.0, v))

    @field_validator("skill_tags", mode="before")
    @classmethod
    def filter_valid_skills(cls, tags):
        if not isinstance(tags, list):
            return ["other_calculus_skill"]
        
        valid_skills = set(e.value for e in SkillTagEnum)
        safe_tags = []
        for tag in tags:
            clean_tag = str(tag).strip()
            if clean_tag in valid_skills:
                safe_tags.append(clean_tag)
            else:
                safe_tags.append("other_calculus_skill")
        
        return list(set(safe_tags))

@app.post("/api/v1/vision/extract-latex")
async def extract_latex(request: ImageExtractRequest):
    """
    Extracts LaTeX from a base64 encoded image using Gemini Flash Vision.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is missing.")
    
    try:
        # Handle potential data URI prefix (e.g., data:image/jpeg;base64,...)
        image_data = request.base64_image.split(",")[-1]
        image_bytes = base64.b64decode(image_data)
        
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        
        image_part = types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg")
        prompt = "You are an expert Math OCR. Extract all mathematical equations and text from this image. Output ONLY the raw LaTeX code. Do NOT wrap the output in markdown blocks like ```latex or ```. Just the raw string."
        
        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[image_part, prompt],
            config=types.GenerateContentConfig(
                temperature=0.0,
            )
        )
        
        extracted_string = response.text.strip()
        return {"latex": extracted_string}
        
    except Exception as e:
        logger.error(f"Vision processing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Vision processing failed: {str(e)}")

@app.post("/api/v1/classify", response_model=ClassifyResponse)
async def classify_question(request: ClassifyRequest):
    """
    Handle topic tagging, skill extraction, bloom taxonomy, and difficulty scoring
    via the Hybrid Pipeline (Remote Lab PC + Cloud Gemini).
    """
    system_prompt_qwen = "You are an Expert Calculus Professor. Solve mathematical problems step-by-step. Show all working in Thai with LaTeX."
    user_prompt_qwen = f"แก้โจทย์ทีละขั้นตอน อย่างละเอียด\n\nโจทย์: {request.question_text}"

    payload_qwen = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt_qwen},
            {"role": "user", "content": user_prompt_qwen}
        ],
        "temperature": 0.0
    }

    url_qwen = f"{LLM_API_BASE_URL}/v1/chat/completions"

    async with httpx.AsyncClient(timeout=180.0) as client:
        try:
            response = await client.post(url_qwen, json=payload_qwen)
            response.raise_for_status()
        except (httpx.ConnectError, httpx.TimeoutException) as e:
            error_msg = f"CRITICAL: Cannot reach the Remote Lab PC at {LLM_API_BASE_URL}. Ensure Tailscale is connected and the remote LLM is bound to 0.0.0.0."
            logger.error(error_msg)
            raise HTTPException(status_code=503, detail=error_msg)
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error from Remote LLM: {e}")
            raise HTTPException(status_code=502, detail="Bad gateway or error from Remote LLM.")
        except Exception as e:
            logger.error(f"Unexpected error calling Remote LLM: {e}")
            raise HTTPException(status_code=500, detail="Internal server error.")

    data_qwen = response.json()
    try:
        correct_reasoning = data_qwen.get("choices", [{}])[0].get("message", {}).get("content", "")
    except Exception as e:
        logger.error(f"Failed to parse Qwen response: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse Lab PC response.")

    # STEP 2: The Formatter (Cloud Gemini)
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is missing.")

    try:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        
        system_instruction_gemini = "You are a Master Calculus Educator and Assessment Data Extractor. Your task is to output strictly valid JSON matching the requested schema."
        
        user_prompt_gemini = f"""[QUESTION]
{request.question_text}

[CHOICES]
A) {request.choice_a}
B) {request.choice_b}
C) {request.choice_c}
D) {request.choice_d}
E) {request.choice_e}

[CORRECT SOLUTION (Generated by AI)]
{correct_reasoning}

CRITICAL RULES FOR EVALUATION & TAXONOMY:
1. Taxonomy: Categorize the question accurately.
   - difficulty: 0.1-0.3 for basic formulas, 0.4-0.6 for multi-step, 0.7-1.0 for complex synthesis.
2. Error Mapping: You MUST reverse-engineer why a student might choose each wrong answer.
   - Did they miscalculate? Forget a constant? Use the wrong sign?
   - DO NOT use the exact same error code for all wrong choices unless absolutely justified.
   - In 'step_by_step_analysis', write a short Thai summary explaining the exact mathematical mistake for each wrong choice.

Output ONLY a JSON object matching EXACTLY this schema:
{{
  "main_topic": "<one of: {_MAIN_TOPICS}>",
  "sub_topic": "<one of: {_SUB_TOPICS}>",
  "skill_tags": ["<select 1-3 items from: {_SKILL_TAGS}>"],
  "bloom_level": "<one of: {_BLOOM_LEVELS}>",
  "difficulty": <float>,
  "discrimination": 0.5,
  "step_by_step_analysis": "<Thai analysis for all choices>",
  "error_code_A": "<one of: {_ERROR_CODES}>",
  "error_code_B": "<one of: {_ERROR_CODES}>",
  "error_code_C": "<one of: {_ERROR_CODES}>",
  "error_code_D": "<one of: {_ERROR_CODES}>",
  "error_code_E": "<one of: {_ERROR_CODES}>"
}}
Use 'correct_answer' for the matching correct choice."""

        gemini_response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=user_prompt_gemini,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction_gemini,
                response_mime_type="application/json",
                temperature=0.0,
            )
        )
        
        raw_json = gemini_response.text.strip()
        parsed_json = json.loads(raw_json)
        return ClassifyResponse(**parsed_json)
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to decode JSON from Gemini response: {e}\nRaw Content: {raw_json}")
        raise HTTPException(status_code=500, detail="Gemini returned invalid JSON format.")
    except Exception as e:
        logger.error(f"Error during Gemini processing: {e}")
        raise HTTPException(status_code=500, detail=f"Gemini processing failed: {str(e)}")
