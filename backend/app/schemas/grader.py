"""
schemas/grader.py
=================
Pydantic request and response models for the LLM Grader endpoint.

These schemas are used by:
  - backend/app/api/v1/endpoints/grader.py  (FastAPI router)
  - backend/app/services/grader_client.py   (HTTP client to the LLM microservice)

Design notes
------------
- GraderRequest carries all the data needed to invoke the pipeline AND to
  select the right error code from the result (selected_choice).
- GraderResponse is intentionally minimal: the frontend only needs to know
  whether the student was correct, which specific error they made, and a
  human-readable feedback text.  Full taxonomy metadata is NOT forwarded;
  it remains inside the LLM microservice.
"""

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Request schema
# ---------------------------------------------------------------------------

class GraderRequest(BaseModel):
    """
    Payload for POST /grader/analyze.

    The caller must supply the complete question context so the pipeline can
    reverse-engineer the wrong choices.  selected_choice controls which
    error_code is extracted from the pipeline's full result.
    """

    student_id: int = Field(..., description="Primary key of the student in the users table.")
    question_id: int = Field(..., description="Primary key of the question in the questions table.")
    question_text: str = Field(..., description="Full question body, may include LaTeX math notation.")

    # Five answer choices — all required so the LLM can analyse every option.
    choice_a: str = Field(..., description="Text of answer choice A.")
    choice_b: str = Field(..., description="Text of answer choice B.")
    choice_c: str = Field(..., description="Text of answer choice C.")
    choice_d: str = Field(..., description="Text of answer choice D.")
    choice_e: str = Field(..., description="Text of answer choice E.")

    # The letter the student actually selected (case-insensitive A–E).
    selected_choice: str = Field(
        ...,
        description="The choice letter the student selected (A, B, C, D, or E).",
    )

    @field_validator("selected_choice")
    @classmethod
    def validate_choice_letter(cls, v: str) -> str:
        """Normalise to uppercase and reject invalid letters."""
        normalised = v.strip().upper()
        if normalised not in {"A", "B", "C", "D", "E"}:
            raise ValueError(
                f"selected_choice must be one of A, B, C, D, E — got '{v}'."
            )
        return normalised


# ---------------------------------------------------------------------------
# Response schema
# ---------------------------------------------------------------------------

class GraderResponse(BaseModel):
    """
    Structured feedback returned to the frontend after the pipeline runs.

    Fields
    ------
    student_id:     Echoed from the request for correlation.
    question_id:    Echoed from the request for correlation.
    selected_choice: The normalised choice letter that was analysed.
    is_correct:     True when the student's error_code is 'correct_answer'.
    error_code:     Specific error taxonomy string for the selected choice.
                    Example values: 'correct_answer', 'sign_error',
                    'forgot_chain_rule_inner', 'arithmetic_error', …
    feedback_text:  The LLM's step_by_step_analysis — a Thai-language
                    paragraph explaining the correct approach and why each
                    wrong choice is wrong.
    """

    student_id: int
    question_id: int
    selected_choice: str
    is_correct: bool
    error_code: str
    feedback_text: str
