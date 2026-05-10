"""
api/v1/endpoints/grader.py
==========================
FastAPI router for the LLM Grader endpoint.

Exposes:
  POST /api/v1/grader/analyze

This router is the thin controller layer between the HTTP interface and the
grader_client service.  It:
  1. Validates the incoming GraderRequest (Pydantic handles this automatically).
  2. Delegates to call_grader_pipeline() in grader_client.py.
  3. Maps service-layer outcomes to appropriate HTTP status codes.

No Knowledge Tracing logic is included here — that remains in quiz_service.py
and ml_client.py.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user_id
from app.schemas.grader import GraderRequest, GraderResponse
from app.services.grader_client import call_grader_pipeline

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/analyze",
    response_model=GraderResponse,
    summary="Grade a student's answer with the LLM pipeline",
    description=(
        "Accepts a calculus question, all 5 answer choices, and the choice "
        "the student selected.  Calls the QwenMath+Gemini pipeline to "
        "determine whether the answer is correct and which specific error "
        "the student made (e.g. 'sign_error', 'forgot_chain_rule_inner')."
        "\n\n"
        "**Note:** This endpoint relies on local Ollama inference and the "
        "Gemini API.  Response times are typically 30–90 seconds.  "
        "The frontend should show a loading indicator while waiting."
    ),
)
def analyze_student_answer(
    request: GraderRequest,
    current_user_id: int = Depends(get_current_user_id),
):
    """
    Grade a student's calculus answer using the LLM pipeline.

    Authorization
    -------------
    - A student may only submit grading requests for themselves
      (student_id must match the JWT token's user_id).
    - Teachers / admins with elevated roles could be exempted here in the
      future; for now strict equality is enforced.

    Returns
    -------
    GraderResponse with is_correct, error_code, and feedback_text.

    Raises
    ------
    403 — student_id in the payload does not match the authenticated user.
    422 — Pydantic validation failed (e.g. selected_choice not in A–E).
    503 — LLM microservice is unavailable (Ollama not running, key missing).
    500 — Unexpected failure inside the pipeline.
    """
    # Authorization: a student can only grade their own submissions.
    if request.student_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="You are not authorised to submit grading requests for another student.",
        )

    # Delegate to the service layer.  call_grader_pipeline() never raises;
    # it returns None when the downstream service is unavailable.
    result = call_grader_pipeline(request)

    if result is None:
        # The service layer already logged the specific error.  We return 503
        # (Service Unavailable) rather than 500 because the root cause is
        # almost always an external dependency (Ollama / Gemini), not a bug.
        raise HTTPException(
            status_code=503,
            detail=(
                "The LLM grader service is currently unavailable. "
                "Please try again in a few moments. "
                "If the problem persists, ensure the Ollama server is running "
                "and the GEMINI_API_KEY is configured correctly."
            ),
        )

    return result
