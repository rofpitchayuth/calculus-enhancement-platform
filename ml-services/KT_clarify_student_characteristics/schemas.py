"""
schemas.py
==========
Pydantic request and response schemas for the KT microservice.

All fields are documented so that the auto-generated OpenAPI (Swagger) docs
at /docs are self-explanatory for the backend team consuming this service.
"""

from typing import List
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Shared sub-model
# ---------------------------------------------------------------------------

class InteractionItem(BaseModel):
    """A single student interaction — one question attempt."""

    skill_id: str = Field(
        ...,
        description=(
            "The skill / question identifier. Must be one of the string keys "
            "present in the trained model's skill_map (e.g. '0', '1', '23'). "
            "These correspond to the continuous integer indices assigned to "
            "each unique question_id during training."
        ),
        examples=["0", "12", "45"],
    )
    correct: int = Field(
        ...,
        ge=0,
        le=1,
        description="Whether the student answered correctly. 1 = correct, 0 = incorrect.",
        examples=[1, 0],
    )


# ---------------------------------------------------------------------------
# /predict_mastery
# ---------------------------------------------------------------------------

class PredictMasteryRequest(BaseModel):
    """
    Request body for POST /predict_mastery.

    The endpoint returns the model's estimate of the probability that this
    student will answer a question on `target_skill_id` correctly, given
    everything the model has seen in `history`.
    """

    student_id: str = Field(
        ...,
        description="Unique student identifier (used for logging/traceability, not model input).",
        examples=["student_001"],
    )
    history: List[InteractionItem] = Field(
        ...,
        description=(
            "Ordered list of the student's past interactions. The sequence order "
            "matters: the GRU processes it left-to-right, so earlier items should "
            "come first. An empty list returns a neutral prior of 0.5."
        ),
    )
    target_skill_id: str = Field(
        ...,
        description="The skill for which mastery is being predicted.",
        examples=["5"],
    )


class PredictMasteryResponse(BaseModel):
    """Response body for POST /predict_mastery."""

    student_id: str = Field(..., description="Echoed from request for correlation.")
    target_skill_id: str = Field(..., description="Echoed from request for correlation.")
    mastery_probability: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description=(
            "Estimated probability (0.0–1.0) that the student answers the next "
            "question on target_skill_id correctly. Values above 0.5 indicate "
            "partial-to-high mastery; values below 0.5 indicate struggle."
        ),
        examples=[0.72],
    )


# ---------------------------------------------------------------------------
# /profile_student
# ---------------------------------------------------------------------------

class ProfileStudentRequest(BaseModel):
    """
    Request body for POST /profile_student.

    The endpoint iterates through the full interaction history, predicts
    mastery BEFORE each question (so the model never sees the answer it is
    predicting), then aggregates the predictions and actual outcomes into a
    student profile label.
    """

    student_id: str = Field(
        ...,
        description="Unique student identifier.",
        examples=["student_042"],
    )
    history: List[InteractionItem] = Field(
        ...,
        min_length=1,
        description=(
            "The student's complete interaction history. Must contain at least "
            "one item. The profiling loop predicts mastery for item[i] using "
            "history[:i] (i.e. all interactions BEFORE item[i])."
        ),
    )


class ProfileStudentResponse(BaseModel):
    """Response body for POST /profile_student."""

    student_id: str = Field(..., description="Echoed from request.")
    accuracy: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Proportion of interactions where the student answered correctly.",
        examples=[0.60],
    )
    avg_mastery: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description=(
            "Average of the model's pre-question mastery predictions across all "
            "interactions in the history. Represents the model's expected "
            "performance level for this student."
        ),
        examples=[0.52],
    )
    profile_label: str = Field(
        ...,
        description=(
            "Student profile category derived from the relationship between "
            "accuracy and avg_mastery. Possible values: "
            "'Lucky Guesser', 'Careless (High Slip)', 'High Achiever', "
            "'Struggling', 'Developing (Average)'."
        ),
        examples=["High Achiever"],
    )
