"""
services/ml_client.py
=====================
Synchronous HTTP client for the KT (Knowledge Tracing) ML microservice.

This module is the single point of contact between the main FastAPI backend
and the KT microservice.  It deliberately uses a SYNCHRONOUS httpx.Client
because quiz_service.py is a synchronous service (def, not async def).

Design principles
-----------------
- Fire-and-forget safety: sync_student_profile() NEVER raises.  If the ML
  service is down, slow, or returns garbage, the error is logged and the
  student's quiz result is still returned normally to the frontend.
- Skill ID mapping: production DB stores main_topic as human-readable strings
  ("limit", "differential", "integral").  The ML model was trained with
  continuous integer indices as skill keys ("0", "1", "2", ...).  This module
  owns the authoritative mapping between the two vocabularies.
- Config-driven URL: the ML service base URL comes from settings.KT_SERVICE_URL
  so it can be changed via .env without touching code.
"""

import logging
from typing import Optional

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Skill ID mapping
# ---------------------------------------------------------------------------
# Maps the production database's main_topic strings → integer string keys that
# exist in the trained DKT-GRU model's skill_map.
#
# The training script (save_production_model.py) used DataLoader which assigns
# continuous integer indices (as strings) to each unique question_id in the
# dataset.  The model's skill_map has keys "0", "1", ..., "N-1".
#
# We assign the three calculus topic families to the first three indices.
# This is deterministic and reproducible across all API calls.
#
# IMPORTANT: if the training skill_map changes (e.g. retraining on new data),
# update this dictionary to match the new index assignments.
MAIN_TOPIC_TO_SKILL_ID: dict = {
    "limit":        "0",
    "differential": "1",
    "integral":     "2",
    "applications": "3",
}

# Fallback for any main_topic not in the mapping above.
# Skill "0" (limit) is used as a safe default; the model will return ~0.5
# for skill indices it hasn't seen enough of — still valid for profiling.
_DEFAULT_SKILL_ID: str = "0"

# HTTP request timeout (seconds).  Enforced on the combined connect + read.
# 5 seconds is generous for a local GRU forward pass; adjust for production.
_TIMEOUT_SECONDS: float = 5.0


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _map_skill_id(main_topic: Optional[str]) -> str:
    """
    Map a production main_topic string to the ML model's skill_id integer key.

    Args:
        main_topic: Value stored in questions.main_topic / quiz_attempts.skill_tag.
                    May be None or an unexpected string.

    Returns:
        A string integer key guaranteed to exist in the trained skill_map.
    """
    if not main_topic:
        return _DEFAULT_SKILL_ID
    return MAIN_TOPIC_TO_SKILL_ID.get(main_topic.strip().lower(), _DEFAULT_SKILL_ID)


def _build_history(session_summary: list) -> list:
    """
    Convert a quiz session_summary list into the history payload format
    expected by the ML microservice's /profile_student endpoint.

    Each item in session_summary must have:
      - 'main_topic' (str | None): the calculus topic of the question.
      - 'is_correct'  (bool):      whether the student answered correctly.

    Returns:
        List of dicts: [{"skill_id": "0", "correct": 1}, ...]
    """
    history = []
    for item in session_summary:
        skill_id = _map_skill_id(item.get("main_topic"))
        history.append({
            "skill_id": skill_id,
            "correct":  1 if item.get("is_correct") else 0,
        })
    return history


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def sync_student_profile(
    user_id: int,
    session_summary: list,
    db: Session,
) -> Optional[dict]:
    """
    Call POST /profile_student on the KT microservice and persist the result.

    This function is designed to be called at the end of a quiz session
    (POST /quiz/end), AFTER the session has been committed to the database.

    Flow
    ----
    1. Build a well-formed history payload from the session_summary, mapping
       main_topic strings to the correct integer skill_id keys.
    2. POST to {KT_SERVICE_URL}/profile_student with a 5-second timeout.
    3. Parse the response: { accuracy, avg_mastery, profile_label }.
    4. Update users.current_profile and users.avg_mastery in the database.
    5. Return the profile dict so the caller can embed it in the API response.

    Error handling
    --------------
    All exceptions (connection errors, timeouts, HTTP errors, unexpected
    exceptions) are caught, logged at ERROR level, and suppressed.  The
    function returns None in that case.  The quiz endpoint must handle None
    gracefully (e.g. by returning null/None fields in the response JSON).

    Args:
        user_id:         Primary key of the student in the users table.
        session_summary: List of question-result dicts built by end_quiz_session().
                         Each dict must contain 'main_topic' and 'is_correct'.
        db:              Active SQLAlchemy session (same transaction context as
                         the caller — we commit only the profile update here).

    Returns:
        Dict with keys 'profile_label', 'avg_mastery', 'accuracy' on success.
        None if the ML service is unavailable or returns an error.
    """
    # Build the payload
    history = _build_history(session_summary)

    if not history:
        logger.warning(
            "sync_student_profile: empty history for user_id=%s — skipping ML call.",
            user_id,
        )
        return None

    payload = {
        "student_id": str(user_id),
        "history":    history,
    }

    try:
        # ----------------------------------------------------------------
        # Step 1: Call the ML microservice (synchronous, with timeout)
        # ----------------------------------------------------------------
        with httpx.Client(timeout=_TIMEOUT_SECONDS) as client:
            response = client.post(
                f"{settings.KT_SERVICE_URL}/profile_student",
                json=payload,
            )
            response.raise_for_status()
            profile_data: dict = response.json()

        profile_label = profile_data.get("profile_label", "Developing (Average)")
        avg_mastery   = float(profile_data.get("avg_mastery", 0.0))
        accuracy      = float(profile_data.get("accuracy", 0.0))

        # ----------------------------------------------------------------
        # Step 2: Persist the updated profile to the users table
        # ----------------------------------------------------------------
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            from app.models.result import StudentStats
            stats = user.student_stats
            if not stats:
                stats = StudentStats(user_id=user_id, skill_mastery={})
                db.add(stats)
            stats.current_profile = profile_label
            stats.avg_mastery     = avg_mastery
            db.commit()
            logger.info(
                "KT profile updated — user_id=%s | label='%s' | "
                "avg_mastery=%.4f | accuracy=%.4f",
                user_id, profile_label, avg_mastery, accuracy,
            )
        else:
            logger.warning(
                "sync_student_profile: user_id=%s not found in DB — "
                "profile not persisted.",
                user_id,
            )

        return {
            "profile_label": profile_label,
            "skill_mastery": avg_mastery,
            "accuracy":      accuracy,
        }

    # ----------------------------------------------------------------
    # Granular error handling — each branch logs a distinct message so
    # ops staff can diagnose issues from logs alone.
    # ----------------------------------------------------------------
    except httpx.ConnectError:
        logger.error(
            "KT service unreachable at '%s' — user answer saved, "
            "student profile NOT updated (user_id=%s).",
            settings.KT_SERVICE_URL, user_id,
        )
    except httpx.TimeoutException:
        logger.error(
            "KT service timed out after %.0fs — student profile NOT "
            "updated (user_id=%s).",
            _TIMEOUT_SECONDS, user_id,
        )
    except httpx.HTTPStatusError as exc:
        logger.error(
            "KT service returned HTTP %s for user_id=%s: %s",
            exc.response.status_code,
            user_id,
            exc.response.text[:300],
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception(
            "Unexpected error in sync_student_profile for user_id=%s: %s",
            user_id, exc,
        )

    # All error paths return None — caller must handle this gracefully.
    return None
