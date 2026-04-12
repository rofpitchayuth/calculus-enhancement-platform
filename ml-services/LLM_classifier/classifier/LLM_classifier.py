import torch
import os
from dotenv import load_dotenv
load_dotenv()
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
import json
import traceback
import re
from pydantic import BaseModel
from typing import List
from enum import Enum

class MainTopicEnum(str, Enum):
    derivatives = "derivatives"
    integrals = "integrals"
    limits_and_continuity = "limits_and_continuity"
    applications = "applications"

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

class TaxonomyData(BaseModel):
    main_topic: MainTopicEnum
    sub_topic: SubTopicEnum
    skill_tags: List[SkillTagEnum]
    bloom_level: BloomLevelEnum
    difficulty: float
    discrimination: float

class ErrorData(BaseModel):
    step_by_step_analysis: str
    error_code_A: ErrorCodeEnum
    error_code_B: ErrorCodeEnum
    error_code_C: ErrorCodeEnum
    error_code_D: ErrorCodeEnum
    error_code_E: ErrorCodeEnum

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

class OutlinesLlamaClassifier:
    def __init__(self):
        print("Loading Llama 3.1 8B")
        
        # 4-bit quantization config to save VRAM
        quantization_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4"
        )
        
        model_name = "meta-llama/Llama-3.1-8B-Instruct"
        
        print("Loading model and tokenizer...")
        
        # Load the base transformer model
        self.base_model = AutoModelForCausalLM.from_pretrained(
            model_name,
            device_map="auto",
            low_cpu_mem_usage=True,
            torch_dtype=torch.bfloat16,
            token=os.environ.get("HF_TOKEN")
        )
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_name,
            token=os.environ.get("HF_TOKEN")
        )
        
        print("✅ Model loaded and ready for native generation!")
        
    def _generate_json(self, messages: list) -> dict:
        prompt_text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )

        inputs = self.tokenizer(
            prompt_text,
            return_tensors="pt"
        ).to(self.base_model.device)

        try:
            outputs = self.base_model.generate(
                **inputs,
                max_new_tokens=3000,
                temperature=0.3,
                repetition_penalty=1.15,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
        except Exception as gen_err:
            print(f"🔥 PyTorch Generate crashed: {str(gen_err)}")
            raise

        generated_tokens = outputs[0][inputs['input_ids'].shape[1]:]
        response_text = self.tokenizer.decode(generated_tokens, skip_special_tokens=True).strip()

        if response_text.startswith("```json"):
            response_text = response_text[7:]
        elif response_text.startswith("```"):
            response_text = response_text[3:]
            
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        response_text = response_text.strip()

        response_text = re.sub(r'(?<!\\)\\(?![\\"/bfnrt])', r'\\\\', response_text)

        # Remove inline comments (e.g., // comment) that break JSON parsing
        response_text = re.sub(r'//.*', '', response_text)

        try:
            parsed_data = json.loads(response_text)
            if isinstance(parsed_data, list) and len(parsed_data) > 0:
                parsed_data = parsed_data[0]
            return parsed_data
        except Exception as e:
            import traceback
            print("\n" + "="*50)
            print("🔥 FAILED TO PARSE JSON. RAW RESPONSE:")
            print(f"[{response_text}]")
            traceback.print_exc()
            print("="*50 + "\n")
            raise RuntimeError(f"JSON Parsing failed: {str(e)}")

    def analyze_question(self, question_text: str, choice_a: str, choice_b: str, choice_c: str, choice_d: str, choice_e: str) -> QuestionAnalysis:
        valid_main = [e.value for e in MainTopicEnum]
        valid_sub = [e.value for e in SubTopicEnum]
        valid_skills = [e.value for e in SkillTagEnum]
        valid_errors = [e.value for e in ErrorCodeEnum]

        # STEP 1: Generate Taxonomy Data
        sys_tax = f"""You are a Calculus Curriculum Expert. Classify the following question into the exact taxonomy provided.
STRICT RULES:
1. main_topic: MUST be exactly one of {valid_main}
2. sub_topic: MUST be exactly one of {valid_sub}. DO NOT put skill tags here.
3. skill_tags: MUST be a list containing ONLY items from {valid_skills}. (e.g., "ftc_evaluation" belongs here, NOT in sub_topic).
4. bloom_level: MUST be one of ["Remembering", "Understanding", "Applying", "Analyzing", "Evaluating", "Creating"]
5. difficulty & discrimination: MUST be a float from 0.0 to 1.0.

EXPECTED JSON TEMPLATE:
{{
  "main_topic": "",
  "sub_topic": "",
  "skill_tags": [],
  "bloom_level": "",
  "difficulty": 0.5,
  "discrimination": 0.5
}}

IMPORTANT: Return ONLY valid raw JSON. DO NOT include any comments (no //).

Question: {question_text}
Choices:
A) {choice_a}
B) {choice_b}
C) {choice_c}
D) {choice_d}
E) {choice_e}
"""
        tax_messages = [{"role": "user", "content": sys_tax}]
        tax_dict = self._generate_json(tax_messages)
        taxonomy_data = TaxonomyData(**tax_dict)

        # STEP 2: Generate Error Analysis Data
        sys_err = f"""You are an Expert Calculus Tutor diagnosing student mistakes.
STRICT RULES:
1. 'step_by_step_analysis': Write in Thai. You are GIVEN the correct answer. 
   - Rule 1A: Be CONCISE. Explain the correct mathematical steps in max 5 sentences.
   - Rule 1B: Explicitly analyze the exact mathematical mistakes that lead to EACH of the other incorrect choices (max 1 sentence per choice).
   - Rule 1C: If you use LaTeX, you MUST double-escape all backslashes (e.g., write \\\\int instead of \\int).
2. 'error_code_X': You MUST set the correct choice's error code to "correct_answer".
3. For all OTHER choices: MUST select the most accurate code from {valid_errors}. DO NOT invent error codes.

EXPECTED JSON TEMPLATE:
{{
  "step_by_step_analysis": "",
  "error_code_A": "",
  "error_code_B": "",
  "error_code_C": "",
  "error_code_D": "",
  "error_code_E": ""
}}

IMPORTANT: Return ONLY valid raw JSON. DO NOT include any inline comments (like // or #) inside the JSON.

Question: {question_text}
Choices:
A) {choice_a}
B) {choice_b}
C) {choice_c}
D) {choice_d}
E) {choice_e}
"""
        err_messages = [{"role": "user", "content": sys_err}]
        err_dict = self._generate_json(err_messages)
        error_data = ErrorData(**err_dict)

        # Merge results into final QuestionAnalysis model
        final_data = {**tax_dict, **err_dict}
        return QuestionAnalysis(**final_data)


# Singleton pattern instances
_classifier = None

def get_classifier():
    """
    Returns the singleton instance of the LLM classifier.
    Loads it automatically if it hasn't been instantiated yet.
    """
    global _classifier
    if _classifier is None:
        _classifier = OutlinesLlamaClassifier()
    return _classifier
