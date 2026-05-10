"""
services/kt_service.py
======================
Backend integration service for the KT (Knowledge Tracing) microservice.

This module provides asynchronous helper functions that the main backend uses
to communicate with the KT FastAPI microservice running at KT_SERVICE_URL.

All HTTP calls are made with httpx.AsyncClient for non-blocking I/O, which
integrates naturally with FastAPI's async request handlers.

Configuration
-------------
Set the environment variable KT_SERVICE_URL to override the default:
  KT_SERVICE_URL=http://kt-service:8001   # Docker Compose service name example

If the variable is not set the service defaults to http://localhost:8001
(suitable for local development where both services run on the same machine).

Usage example (inside a FastAPI endpoint in the main backend)
-------------------------------------------------------------
    from services.kt_service import KTService

    @router.post("/end_quiz")
    async def end_quiz(user_id: int, session_id: int, db: Session = Depends(get_db)):
        quiz_service = QuizService(db)
        result = quiz_service.end_quiz_session(user_id, session_id)

        # Build the history list from the session summary
        history = [
            {"skill_id": item["main_topic"], "correct": 1 if item["is_correct"] else 0}
            for item in result["session_summary"]
        ]

        profile = await KTService.profile_student(str(user_id), history)
        result["student_profile"] = profile
        return result
"""

import os
import logging
from typing import List, Dict, Any, Optional

import httpx

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Base URL of the KT microservice.  Override via environment variable in
# production (Docker Compose, Kubernetes, etc.)
KT_SERVICE_URL: str = os.getenv("KT_SERVICE_URL", "http://localhost:8001")

# Timeout for HTTP requests to the KT service (seconds).
# Kept generous because the GRU forward pass on long histories can take ~100ms.
REQUEST_TIMEOUT: float = float(os.getenv("KT_SERVICE_TIMEOUT", "10.0"))


# ---------------------------------------------------------------------------
# Service class
# ---------------------------------------------------------------------------

class KTService:
    """
    Async client wrapper for the KT microservice REST API.

    All methods are class-level (no instance needed) — call them directly:
        profile = await KTService.profile_student(student_id, history)
    """

    @staticmethod
    async def predict_mastery(
        student_id: str,
        history: List[Dict[str, Any]],
        target_skill_id: str,
    ) -> Optional[float]:
        """
        Call POST /predict_mastery on the KT microservice.

        Args:
            student_id:       Unique identifier for the student.
            history:          List of dicts, each with 'skill_id' (str) and
                              'correct' (int: 0 or 1).
            target_skill_id:  The skill for which mastery is being predicted.

        Returns:
            Float in [0.0, 1.0] — mastery probability.
            Returns None if the KT service is unreachable or returns an error;
            the calling code should handle this gracefully (e.g. fall back to 0.5).
        """
        payload = {
            "student_id": student_id,
            "history": history,
            "target_skill_id": target_skill_id,
        }

        try:
            async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
                response = await client.post(
                    f"{KT_SERVICE_URL}/predict_mastery",
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                return float(data["mastery_probability"])

        except httpx.ConnectError:
            logger.error(
                "KT service unreachable at %s. Is the microservice running?",
                KT_SERVICE_URL,
            )
        except httpx.HTTPStatusError as exc:
            logger.error(
                "KT service returned HTTP %s for predict_mastery: %s",
                exc.response.status_code,
                exc.response.text,
            )
        except Exception as exc:
            logger.error("Unexpected error calling predict_mastery: %s", exc)

        return None

    @staticmethod
    async def profile_student(
        student_id: str,
        history: List[Dict[str, Any]],
    ) -> Optional[Dict[str, Any]]:
        """
        Call POST /profile_student on the KT microservice.

        Args:
            student_id: Unique identifier for the student.
            history:    Complete ordered list of interaction dicts, each with
                        'skill_id' (str) and 'correct' (int: 0 or 1).

        Returns:
            Dict with keys:
              'student_id'    (str)
              'accuracy'      (float)
              'avg_mastery'   (float)
              'profile_label' (str) — one of:
                  "Lucky Guesser", "Careless (High Slip)",
                  "High Achiever", "Struggling", "Developing (Average)"
            Returns None if the KT service is unreachable or errors out.
        """
        if not history:
            logger.warning("profile_student called with empty history for student %s", student_id)
            return None

        payload = {
            "student_id": student_id,
            "history": history,
        }

        try:
            async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
                response = await client.post(
                    f"{KT_SERVICE_URL}/profile_student",
                    json=payload,
                )
                response.raise_for_status()
                return response.json()

        except httpx.ConnectError:
            logger.error(
                "KT service unreachable at %s. Is the microservice running?",
                KT_SERVICE_URL,
            )
        except httpx.HTTPStatusError as exc:
            logger.error(
                "KT service returned HTTP %s for profile_student: %s",
                exc.response.status_code,
                exc.response.text,
            )
        except Exception as exc:
            logger.error("Unexpected error calling profile_student: %s", exc)

        return None

    @staticmethod
    async def health_check() -> bool:
        """
        Ping the KT microservice's /health endpoint.

        Returns:
            True if the service responds with HTTP 200, False otherwise.
            Useful for startup checks or admin dashboard status panels.
        """
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                response = await client.get(f"{KT_SERVICE_URL}/health")
                return response.status_code == 200
        except Exception:
            return False
