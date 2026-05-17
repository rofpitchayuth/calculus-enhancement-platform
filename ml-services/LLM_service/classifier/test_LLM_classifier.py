import os
import json
import time
import ollama
from google import genai
from google.genai import types
from dotenv import load_dotenv
from pydantic import BaseModel, field_validator
from typing import List
from enum import Enum

import httpx
def _dbg(msg: str) -> None:
    """Print a timestamped debug line to stdout."""
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)

load_dotenv()

class MainTopicEnum(str, Enum):
    LIMIT = "LIMIT"
    DIFFERENTIAL = "DIFFERENTIAL"
    INTEGRAL = "INTEGRAL"
    APPLICATIONS = "APPLICATIONS"

class SubTopicEnum(str, Enum):
    # Limits and Continuity
    limit_laws = "limit_laws"
    evaluating_limits = "evaluating_limits"
    algebraic_limits = "algebraic_limits"
    limits_at_infinity = "limits_at_infinity"
    trigonometric_limits = "trigonometric_limits"
    continuity = "continuity"

    # Derivatives
    definition_of_derivative = "definition_of_derivative"
    derivative_rules = "derivative_rules"
    product_rule = "product_rule"
    chain_rule = "chain_rule"
    advanced_derivative_rules = "advanced_derivative_rules"
    implicit_differentiation = "implicit_differentiation"
    implicit_functions = "implicit_functions"
    second_derivative = "second_derivative"
    higher_order_derivatives = "higher_order_derivatives"

    # Applications of Derivatives
    applications_of_derivatives = "applications_of_derivatives"
    curve_sketching_analysis = "curve_sketching_analysis"
    optimization = "optimization"
    related_rates = "related_rates"
    kinematics = "kinematics"

    # Integrals and Techniques
    indefinite_integrals = "indefinite_integrals"
    definite_integrals = "definite_integrals"
    integration_techniques = "integration_techniques"
    substitution_and_techniques = "substitution_and_techniques"
    integration_by_parts = "integration_by_parts"
    advanced_integration = "advanced_integration"

    # Applications of Integration
    area_and_volume = "area_and_volume"

    # Functions and Miscellaneous
    trigonometric_functions = "trigonometric_functions"
    trig_identities = "trig_identities"
    inverse_functions = "inverse_functions"
    applications = "applications"
    other = "other"

class SkillTag(str, Enum):
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

class QuestionAnalysis(BaseModel):
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

_MAIN_TOPICS   = ", ".join(e.value for e in MainTopicEnum)
_SUB_TOPICS    = ", ".join(e.value for e in SubTopicEnum)
_SKILL_TAGS    = ", ".join(e.value for e in SkillTagEnum)
_BLOOM_LEVELS  = ", ".join(e.value for e in BloomLevelEnum)
_ERROR_CODES   = ", ".join(e.value for e in ErrorCodeEnum)

class QwenMathPipeline:
    MATH_MODEL = "mightykatun/qwen2.5-math:7b"

    def __init__(self):
        _dbg(f"[Pipeline] Initializing Hybrid Architecture (Local Ollama + Cloud Gemini)...")
        
        # --- Configure Gemini API (New SDK) ---
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            raise ValueError("GEMINI_API_KEY not found in .env file!")
        
        self.gemini_client = genai.Client(api_key=gemini_api_key)
        _dbg("[Pipeline] Gemini API (New SDK) configured successfully.")

        # --- Configure Ollama (Remote/Local) ---
        self.ollama_base_url = os.getenv("LLM_API_BASE_URL", "http://127.0.0.1:11434")
        self.ollama_client = ollama.Client(host=self.ollama_base_url)
        try:
            models = self.ollama_client.list()
            available = [m.model for m in models.models]
            if self.MATH_MODEL not in available and f"{self.MATH_MODEL}:latest" not in available:
                _dbg(f"[Pipeline] WARNING — Model '{self.MATH_MODEL}' is missing! Please run 'ollama run {self.MATH_MODEL}'")
            _dbg(f"[Pipeline] Local/Remote Math Model verified at {self.ollama_base_url}. Ready!")
        except (httpx.ConnectError, Exception) as e:
            _dbg("Failed to connect to Remote Lab PC via Tailscale. Check VPN status.")
            raise RuntimeError(f"Cannot connect to Ollama. Original error: {e}")

    # ── Helpers ──────────────────────────────────────────────────────────────

    def _solve_with_ollama(self, question_text: str) -> str:
        _dbg(f"  [Step 1/2] >>> Local Math Solving (Model: {self.MATH_MODEL})")
        
        system = "You are an Expert Calculus Professor. Solve mathematical problems step-by-step. Show all working in Thai with LaTeX."
        user = f"แก้โจทย์ทีละขั้นตอน อย่างละเอียด\n\nโจทย์: {question_text}"
        
        t0 = time.time()
        chunks = []
        token_count = 0

        options = {"temperature": 0.0, "num_ctx": 2048}
        kwargs = {
            "model": self.MATH_MODEL,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user",   "content": user},
            ],
            "options": options,
            "stream": True,
            "keep_alive": 0, 
        }

        try:
            stream = self.ollama_client.chat(**kwargs)
            print(f"  [Step 1/2] Generating", end="", flush=True)
            for chunk in stream:
                token = chunk["message"]["content"]
                chunks.append(token)
                token_count += 1
                if token_count % 10 == 0:
                    print(".", end="", flush=True)
            print(f" ({token_count} tokens)", flush=True)

        except (httpx.ConnectError, Exception) as exc:
            _dbg("Failed to connect to Remote Lab PC via Tailscale. Check VPN status.")
            _dbg(f"  [Step 1/2] ERROR — ollama.chat() raised: {exc}")
            raise

        elapsed = time.time() - t0
        _dbg(f"  [Step 1/2] <<< Solving complete in {elapsed:.1f}s")
        return "".join(chunks).strip()

    def _analyze_with_gemini(self, question_text: str, choices_text: str, correct_reasoning: str) -> dict:
        _dbg(f"  [Step 2/2] >>> Cloud Analysis (Model: Gemini 2.5 Flash)")
        
        system_instruction = "You are a Master Calculus Educator and Assessment Data Extractor. Your task is to output strictly valid JSON matching the requested schema."
        
        user_prompt = f"""[QUESTION]
{question_text}

[CHOICES]
{choices_text}

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

        t0 = time.time()
        
        try:
            print(f"  [Step 2/2] Waiting for Gemini API to analyze...", end="", flush=True)
            response = self.gemini_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    temperature=0.0,
                )
            )
            print(" Done!", flush=True)
        except Exception as exc:
            _dbg(f"  [Step 2/2] ERROR — Gemini API raised: {exc}")
            raise

        elapsed = time.time() - t0
        _dbg(f"  [Step 2/2] <<< Cloud Analysis complete in {elapsed:.1f}s")
        
        raw_json = response.text.strip()
        try:
            return json.loads(raw_json)
        except json.JSONDecodeError as exc:
            _dbg(f"  [Step 2/2] WARNING — JSON parse FAILED: {exc}")
            _dbg(f"  [Step 2/2] Raw Output: {raw_json}")
            raise

    # ── Public API ───────────────────────────────────────────────────────────

    def analyze_question(self, question_text: str, choice_a: str, choice_b: str, choice_c: str, choice_d: str, choice_e: str) -> QuestionAnalysis:
        _t_total = time.time()
        choices_text = f"A) {choice_a}\nB) {choice_b}\nC) {choice_c}\nD) {choice_d}\nE) {choice_e}"

        # ── เฟส 1: แก้โจทย์ (Local) ───────────────────────────────────────────
        correct_reasoning = self._solve_with_ollama(question_text)

        # ── เฟส 2: ตรวจและจัดหมวดหมู่ (Cloud) ──────────────────────────────────
        final_json_dict = self._analyze_with_gemini(question_text, choices_text, correct_reasoning)

        # ── Validate ด้วย Pydantic ───────────────────────────────────────────
        try:
            result = QuestionAnalysis(**final_json_dict)
        except Exception as exc:
            _dbg(f"[Pipeline] ERROR — Pydantic validation failed: {exc}")
            _dbg(f"[Pipeline] Received JSON was:\n{json.dumps(final_json_dict, indent=2, ensure_ascii=False)}")
            raise

        _dbg(f"[Pipeline] Analysis complete! Total time: {time.time()-_t_total:.1f}s")
        return result

_pipeline = None

def get_pipeline() -> QwenMathPipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = QwenMathPipeline()
    return _pipeline

if __name__ == "__main__":
    SAMPLE_QUESTION = (
        r"กำหนด $f$ เป็นพหุนามกำลังสองมีค่าต่ำสุดเป็น -18 และเส้นตรง $4x+y+12=0$ สัมผัส $y=f(x)$ ที่ $x=1$ หาพื้นที่ใต้โค้งกับแกน X เมื่อ $0 \le x \le 3$"
    )
    SAMPLE_CHOICES = {
        "A": "24",
        "B": "32",
        "C": "36",
        "D": "48",
        "E": "54",
    }

    pipeline = get_pipeline()

    analysis = pipeline.analyze_question(
        question_text=SAMPLE_QUESTION,
        choice_a=SAMPLE_CHOICES["A"],
        choice_b=SAMPLE_CHOICES["B"],
        choice_c=SAMPLE_CHOICES["C"],
        choice_d=SAMPLE_CHOICES["D"],
        choice_e=SAMPLE_CHOICES["E"],
    )

    print("\n" + "=" * 70)
    print(json.dumps(analysis.model_dump(), indent=2, ensure_ascii=False))