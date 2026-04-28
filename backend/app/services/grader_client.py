"""
services/grader_client.py
=========================
HTTP client that bridges the main FastAPI backend → LLM Grader microservice.

Responsibilities
----------------
1. Build the payload for POST {LLM_SERVICE_URL}/analyze_question.
2. Call the microservice with a generous timeout (the pipeline can take 90 s+).
3. Parse the full QuestionAnalysis JSON returned by the microservice.
4. Extract the error_code that corresponds to the student's selected_choice.
5. Determine is_correct (True when error_code == "correct_answer").
6. Return a clean GraderResponse to the router.

Error handling philosophy
-------------------------
This client uses the same "fail loudly" strategy as ml_client.py for the KT
service.  Granular except branches log actionable messages so ops staff can
diagnose issues from logs alone.  The router (grader.py) maps these exceptions
to appropriate HTTP status codes rather than returning 500 for everything.

Important: the pipeline is slow by design (Ollama inference + Gemini API).
The HTTPX timeout is intentionally set to 180 s.  Adjust LLM_GRADER_TIMEOUT
in settings if your hardware is significantly faster or slower.
"""

import logging
from typing import Optional

import httpx

from app.core.config import settings
from app.schemas.grader import GraderRequest, GraderResponse

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Seconds to wait for the LLM microservice to respond.
# The pipeline has two slow steps: Ollama streaming + Gemini API call.
# 180 s covers even heavily loaded machines running Qwen-7B at 4-bit.
_LLM_TIMEOUT_SECONDS: float = 180.0

# The error_code value that the pipeline assigns to the correct answer choice.
_CORRECT_ANSWER_CODE: str = "correct_answer"

# Mapping from uppercase choice letter → field name in the microservice JSON.
_CHOICE_TO_FIELD: dict[str, str] = {
    "A": "error_code_A",
    "B": "error_code_B",
    "C": "error_code_C",
    "D": "error_code_D",
    "E": "error_code_E",
}


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _extract_error_code(analysis_json: dict, selected_choice: str) -> str:
    """
    Extract the error_code for the student's selected choice from the full
    QuestionAnalysis dict returned by the LLM microservice.

    Args:
        analysis_json:   Parsed JSON dict from /analyze_question response.
        selected_choice: Uppercase choice letter, e.g. "B".

    Returns:
        The error_code string, e.g. "sign_error".

    Raises:
        KeyError: if the expected field is missing from the response (should
                  not happen if the microservice validates via Pydantic, but
                  we protect against malformed responses).
    """
    field_name = _CHOICE_TO_FIELD[selected_choice]  # e.g. "error_code_B"
    error_code = analysis_json.get(field_name)

    if error_code is None:
        raise KeyError(
            f"Field '{field_name}' is missing from the LLM microservice response. "
            f"Full response keys: {list(analysis_json.keys())}"
        )

    return str(error_code)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def call_grader_pipeline(request: GraderRequest) -> Optional[GraderResponse]:
    """
    Call the LLM Grader microservice and return a structured GraderResponse.

    This is a **synchronous** function (using httpx.Client, not AsyncClient)
    because it is called from synchronous service/router code — consistent
    with how sync_student_profile() works in ml_client.py.

    Flow
    ----
    1. Build the /analyze_question payload (question_text + 5 choices).
    2. POST to {LLM_SERVICE_URL}/analyze_question with a 180-second timeout.
    3. Parse the full QuestionAnalysis JSON.
    4. Extract error_code_<selected_choice> from the response.
    5. Determine is_correct from the error code.
    6. Build and return GraderResponse.

    Args:
        request: Validated GraderRequest from the router.

    Returns:
        GraderResponse on success, None if the LLM service is unavailable or
        returns an error.  The router converts None into an HTTP error.

    Raises:
        This function does NOT raise.  All exceptions are caught, logged, and
        converted to a None return value.  The caller must handle None.
    """
    # Build the JSON payload expected by the LLM microservice.
    payload = {
        "question_text": request.question_text,
        "choice_a":      request.choice_a,
        "choice_b":      request.choice_b,
        "choice_c":      request.choice_c,
        "choice_d":      request.choice_d,
        "choice_e":      request.choice_e,
    }

    url = f"{settings.LLM_SERVICE_URL}/analyze_question"

    try:
        # ------------------------------------------------------------------
        # Step 1: Call the LLM microservice
        # ------------------------------------------------------------------
        logger.info(
            "Calling LLM grader for student_id=%s question_id=%s (choice=%s)",
            request.student_id,
            request.question_id,
            request.selected_choice,
        )

        with httpx.Client(timeout=_LLM_TIMEOUT_SECONDS) as client:
            response = client.post(url, json=payload)
            response.raise_for_status()
            analysis_json: dict = response.json()

        # ------------------------------------------------------------------
        # Step 2: Extract the per-student error code
        # ------------------------------------------------------------------
        error_code = _extract_error_code(analysis_json, request.selected_choice)
        is_correct  = (error_code == _CORRECT_ANSWER_CODE)
        feedback    = analysis_json.get("step_by_step_analysis", "")

        logger.info(
            "Grader result — student_id=%s question_id=%s choice=%s "
            "error_code='%s' is_correct=%s",
            request.student_id,
            request.question_id,
            request.selected_choice,
            error_code,
            is_correct,
        )

        return GraderResponse(
            student_id=request.student_id,
            question_id=request.question_id,
            selected_choice=request.selected_choice,
            is_correct=is_correct,
            error_code=error_code,
            feedback_text=feedback,
        )

    # ----------------------------------------------------------------------
    # Granular error handling — each branch logs a distinct, actionable message.
    # ----------------------------------------------------------------------

    except httpx.ConnectError:
        # The LLM microservice process is not running or not reachable.
        logger.error(
            "LLM grader service unreachable at '%s'. "
            "Ensure 'uvicorn main:app --port 8002' is running (student_id=%s).",
            url,
            request.student_id,
        )

    except httpx.TimeoutException:
        # The pipeline took longer than _LLM_TIMEOUT_SECONDS seconds.
        logger.error(
            "LLM grader timed out after %.0f s for student_id=%s question_id=%s. "
            "The Ollama model may be loading or the system is under heavy load.",
            _LLM_TIMEOUT_SECONDS,
            request.student_id,
            request.question_id,
        )

    except httpx.HTTPStatusError as exc:
        status = exc.response.status_code
        body   = exc.response.text[:400]

        if status == 429:
            # Gemini API quota exceeded — temporary, retry after a delay.
            logger.error(
                "LLM grader received HTTP 429 (Gemini quota exceeded) "
                "for student_id=%s. Retry after cooldown. Body: %s",
                request.student_id,
                body,
            )
        elif status == 503:
            # Ollama is not running or the model is not pulled.
            logger.error(
                "LLM grader returned HTTP 503 (pipeline unavailable) "
                "for student_id=%s. Body: %s",
                request.student_id,
                body,
            )
        else:
            logger.error(
                "LLM grader returned HTTP %s for student_id=%s. Body: %s",
                status,
                request.student_id,
                body,
            )

    except KeyError as exc:
        # Unexpected response shape — field missing from the microservice JSON.
        logger.error(
            "LLM grader response is missing expected field for student_id=%s: %s",
            request.student_id,
            exc,
        )

    except Exception as exc:  # noqa: BLE001
        # Catch-all for JSON decode errors, Pydantic failures, etc.
        logger.exception(
            "Unexpected error in call_grader_pipeline for student_id=%s: %s",
            request.student_id,
            exc,
        )

    # All error paths return None — the router must handle this gracefully.
    return None
