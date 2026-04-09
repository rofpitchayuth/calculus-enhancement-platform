import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
import json
import outlines
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

class QuestionAnalysis(BaseModel):
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
    reasoning: str

class OutlinesLlamaClassifier:
    """
    A local Llama 3.2 3B classifier using `outlines` to enforce strict JSON schemas.
    """
    def __init__(self):
        print("Loading Llama 3.2 3B with 4-bit quantization...")
        
        # 4-bit quantization config to save VRAM
        quantization_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4"
        )
        
        model_name = "meta-llama/Llama-3.2-3B-Instruct"
        
        print("Loading model and tokenizer...")
        
        # Load the base transformer model
        self.base_model = AutoModelForCausalLM.from_pretrained(
            model_name,
            quantization_config=quantization_config,
            device_map="auto",
            low_cpu_mem_usage=True,
            dtype=torch.float16
        )
        
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        
        # Initialize outlines model wrapping the transformers model
        print("Initializing Outlines guided generation wrapper...")
        self.model_wrapper = outlines.from_transformers(self.base_model, self.tokenizer)
        print("✅ Model loaded and outlines model wrapper ready!")
        
    def analyze_question(self, question_text: str, choice_a: str, choice_b: str, choice_c: str, choice_d: str, choice_e: str) -> QuestionAnalysis:
        """
        Uses outlines to force the LLM to generate a valid `QuestionAnalysis` JSON object.
        """
        prompt = f"""
You are an Expert Calculus Tutor analyzing a multiple-choice question for a Knowledge Tracing platform. 
Your task is to classify the question strictly using the provided taxonomy and evaluate the specific mathematical misconceptions behind every incorrect choice.

CRITICAL RULES:
1. 'difficulty': MUST be a float from 0.0 (very easy) to 1.0 (extremely hard). 
2. 'discrimination': MUST be a float from 0.0 to 1.0.
3. 'error_code_X': For the choice that is the correct answer, you MUST output "correct_answer". For all other choices, select the most accurate error code from the ErrorCodeEnum.

FEW-SHOT EXAMPLES:

=== Example 1 ===
Question: จงหาค่าของ \\int(3x^{{2}}-2x+5)dx
Choices:
A) x^3 - x^2 + 5x + C
B) 3x^3 - 2x^2 + 5x + C
C) x^3 - x^2 + 5 + C
D) x^3 - x^2 + 5x
E) 6x - 2

Expected Output Analysis:
- main_topic: integrals
- sub_topic: indefinite_integrals
- skill_tags: ["power_rule_integration"]
- bloom_level: Applying
- difficulty: 0.20
- discrimination: 0.30
- correct choice is A, so error_code_A: correct_answer
- B forgot to divide by n+1, so error_code_B: arithmetic_error
- C forgot to integrate 5x, so error_code_C: arithmetic_error
- D forgot the constant C, so error_code_D: forgot_plus_c
- E took the derivative instead, so error_code_E: derivative_instead_of_integral
- reasoning: This is a basic indefinite integral requiring the power rule.

=== Example 2 ===
Question: \\lim_{{x \\to \\infty}}\\frac{{5x^3 - 2x + 1}}{{2x^3 + 7}}
Choices:
A) 0
B) \\frac{{5}}{{2}}
C) 1
D) หาค่าไม่ได้
E) 5

Expected Output Analysis:
- main_topic: limits_and_continuity
- sub_topic: limits_at_infinity
- skill_tags: ["factoring_and_canceling", "lhopitals_rule"]
- bloom_level: Applying
- difficulty: 0.40
- discrimination: 0.40
- correct choice is B, so error_code_B: correct_answer
- A represents misunderstanding limits to infinity (bottom heavy), so error_code_A: conceptual_misunderstanding
- C is an arithmetic error, so error_code_C: arithmetic_error
- D represents indeterminate form misconception, so error_code_D: indeterminate_form_misconception
- E represents ignoring the denominator, so error_code_E: fraction_operation_error
- reasoning: Limits at infinity for rational functions with equal highest degrees yield the ratio of leading coefficients (5/2).

=== YOUR TURN ===
Now analyze the following question:

Question: {question_text}
Choices:
A) {choice_a}
B) {choice_b}
C) {choice_c}
D) {choice_d}
E) {choice_e}

Generate the JSON output following the strict schema.
"""
        # Generate the structured response
        # The return value is inherently validated and parsed as a QuestionAnalysis Pydantic model
        result = self.model_wrapper(prompt, QuestionAnalysis, max_new_tokens=2048)
        
        # Convert the raw JSON string into the expected Pydantic model
        if isinstance(result, str):
            parsed_dict = json.loads(result)
            return QuestionAnalysis(**parsed_dict)
            
        return result


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
