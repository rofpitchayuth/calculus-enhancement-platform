"""
main.py
=======
FastAPI microservice — KT_clarify_student_characteristics
=========================================================

Exposes two REST endpoints that the main calculus-enhancement-platform backend
calls to get knowledge-tracing predictions and student profiles:

  POST /predict_mastery    — single mastery probability for a target skill
  POST /profile_student    — full student behavioural profile label

The DKT-GRU model is loaded ONCE at application startup via the lifespan
context manager (the modern FastAPI pattern that supersedes @app.on_event).
The loaded model is stored in app.state so it can be dependency-injected into
endpoint handlers without global variables.

Usage
-----
  uvicorn main:app --host 0.0.0.0 --port 8001 --reload

  Interactive docs: http://localhost:8001/docs
  Health check:     http://localhost:8001/health
"""

from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# ---------------------------------------------------------------------------
# Local imports
# ---------------------------------------------------------------------------
import config  # reads skill_map.json and validates paths on import
from models.dkt_gru import DKTGRUInference
from schemas import (
    InteractionItem,
    PredictMasteryRequest,
    PredictMasteryResponse,
    ProfileStudentRequest,
    ProfileStudentResponse,
)


# ---------------------------------------------------------------------------
# Application lifespan — model is loaded here, ONCE, before any request is served
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup / shutdown lifecycle manager.

    On startup:
      1. Instantiate DKTGRUInference with the architecture dimensions read
         from dkt_gru_skill_map.json (guarantees dimensions match state_dict).
      2. Load the trained weights from dkt_gru_production.pt.
      3. The wrapper's __init__ already calls model.eval(), so the GRU's
         dropout layers are disabled for inference.
      4. Store the wrapper in app.state.model for use by endpoint handlers.

    On shutdown: nothing special needed (PyTorch tensors are garbage-collected).
    """
    print("=" * 55)
    print("  KT Microservice — starting up")
    print("=" * 55)
    print(f"  Architecture : {config.MODEL_ARCH}")
    print(f"  num_skills   : {config.NUM_SKILLS}")
    print(f"  hidden_size  : {config.HIDDEN_SIZE}")
    print(f"  dropout      : {config.DROPOUT:.4f}")
    print(f"  trained on   : {config.TRAINED_ON}  ({config.TRAIN_EPOCHS} epochs)")
    print(f"  device       : {config.INFERENCE_DEVICE}")
    print(f"  weights file : {config.MODEL_WEIGHTS_PATH.name}")

    # --- Step 1: Build the model shell with correct architecture ---
    inference_wrapper = DKTGRUInference(
        num_skills=config.NUM_SKILLS,
        hidden_size=config.HIDDEN_SIZE,
        dropout=config.DROPOUT,
        skill_map=config.SKILL_MAP,
        num_layers=config.NUM_LAYERS,
        device=config.INFERENCE_DEVICE,
    )

    # --- Step 2: Load trained weights from the .pt file ---
    inference_wrapper.load_weights(str(config.MODEL_WEIGHTS_PATH))
    print(f"  [OK] Weights loaded from {config.MODEL_WEIGHTS_PATH.name}")
    print(f"  [OK] Model in eval() mode — ready for inference")
    print("=" * 55)

    # --- Step 3: Attach to application state ---
    app.state.model = inference_wrapper

    yield  # -- application is now serving requests --

    # Shutdown (cleanup if needed in the future)
    print("KT Microservice — shutting down.")


# ---------------------------------------------------------------------------
# FastAPI application instance
# ---------------------------------------------------------------------------

app = FastAPI(
    title="KT Student Characteristics Microservice",
    description=(
        "Deep Knowledge Tracing (GRU) inference service. "
        "Provides mastery predictions and behavioural profiling for students "
        "on the Calculus Enhancement Platform."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS — allow the main backend and frontend origins
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helper: retrieve the loaded model from app state (keeps handlers clean)
# ---------------------------------------------------------------------------

def _get_model() -> DKTGRUInference:
    """Return the inference wrapper stored in app.state."""
    return app.state.model


# ---------------------------------------------------------------------------
# Utility: classify a student given accuracy and avg_mastery
# ---------------------------------------------------------------------------

def _classify_student(accuracy: float, avg_mastery: float) -> str:
    """
    Apply the profiling decision tree.

    Decision logic (in priority order):
      1. diff >= +0.10 → student performs much BETTER than the model expects
                         → "Lucky Guesser" (or careless test-taking strategy)
      2. diff <= -0.10 → student performs much WORSE than expected
                         → "Careless (High Slip)" (high slip rate)
      3. Both metrics high (>= 0.55) → "High Achiever"
      4. Both metrics low  (<= 0.45) → "Struggling"
      5. Otherwise           → "Developing (Average)"

    Args:
        accuracy:    Fraction of questions answered correctly in the history.
        avg_mastery: Mean pre-question mastery predicted by the GRU.

    Returns:
        One of the five profile label strings.
    """
    diff = accuracy - avg_mastery

    if diff >= 0.10:
        return "Lucky Guesser"
    elif diff <= -0.10:
        return "Careless (High Slip)"
    elif avg_mastery >= 0.55 and accuracy >= 0.55:
        return "High Achiever"
    elif avg_mastery <= 0.45 and accuracy <= 0.45:
        return "Struggling"
    else:
        return "Developing (Average)"


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health", tags=["Status"])
async def health_check():
    """
    Liveness probe.

    Returns a simple JSON confirming the service is running and the model
    is loaded.  The main backend's docker-compose health-check can poll this.
    """
    return {
        "status": "healthy",
        "model": config.MODEL_ARCH,
        "num_skills": config.NUM_SKILLS,
    }


@app.post(
    "/predict_mastery",
    response_model=PredictMasteryResponse,
    tags=["Knowledge Tracing"],
    summary="Predict mastery probability for a target skill",
)
async def predict_mastery(request: PredictMasteryRequest):
    """
    Given a student's interaction history and a target skill, return the DKT-GRU's
    estimated probability that the student will answer the next question on that
    skill correctly.

    **How it works**
    - The history is one-hot encoded into a sequence tensor of shape
      `(1, seq_len, num_skills * 2)`.
    - The GRU processes the full sequence and outputs per-skill mastery
      probabilities at every time step.
    - The value at the LAST time step for `target_skill_id` is returned.

    **Skill IDs**
    Use the integer-string keys from the model's skill_map (e.g. `"0"`, `"23"`).
    These correspond to the continuous question indices assigned during training.
    """
    model = _get_model()

    # Convert Pydantic InteractionItem objects to plain dicts for the inference wrapper
    history_dicts: List[dict] = [
        {"skill_id": item.skill_id, "correct": item.correct}
        for item in request.history
    ]

    mastery_prob = model.predict_mastery(
        history=history_dicts,
        target_skill_id=request.target_skill_id,
    )

    return PredictMasteryResponse(
        student_id=request.student_id,
        target_skill_id=request.target_skill_id,
        mastery_probability=mastery_prob,
    )


@app.post(
    "/profile_student",
    response_model=ProfileStudentResponse,
    tags=["Knowledge Tracing"],
    summary="Generate a behavioural profile label for a student",
)
async def profile_student(request: ProfileStudentRequest):
    """
    Analyse a student's full interaction history and return a behavioural profile.

    **Algorithm**

    For each interaction `i` in the history (0-indexed):
      1. Obtain `history[:i]`  — all interactions BEFORE question `i`.
      2. Call `predict_mastery(history[:i], skill_id=history[i].skill_id)`.
         This gives the model's pre-question mastery estimate.
      3. Record the prediction and whether the student actually got it right.

    After processing all interactions:
      - `accuracy`    = (number correct) / (total interactions)
      - `avg_mastery` = mean of all pre-question mastery predictions

    The profiling rule (diff = accuracy − avg_mastery):
      - diff ≥ +0.10            → "Lucky Guesser"
      - diff ≤ −0.10            → "Careless (High Slip)"
      - avg_mastery ≥ 0.55 AND accuracy ≥ 0.55 → "High Achiever"
      - avg_mastery ≤ 0.45 AND accuracy ≤ 0.45 → "Struggling"
      - otherwise               → "Developing (Average)"

    **Note on the first interaction**
    For `i=0` there is no prior history.  The model returns the neutral prior
    (0.5) for that interaction, which is the correct epistemic stance.
    """
    model = _get_model()

    if not request.history:
        # Pydantic min_length=1 prevents this, but guard defensively
        raise HTTPException(status_code=422, detail="history must not be empty.")

    mastery_predictions: List[float] = []
    correct_outcomes: List[int] = []

    # Iterate through each interaction; predict mastery BEFORE seeing the answer
    for i, interaction in enumerate(request.history):
        # History visible to the model = everything before interaction i
        prior_history = [
            {"skill_id": item.skill_id, "correct": item.correct}
            for item in request.history[:i]
        ]

        # Pre-question mastery estimate for this skill
        pre_mastery = model.predict_mastery(
            history=prior_history,
            target_skill_id=interaction.skill_id,
        )

        mastery_predictions.append(pre_mastery)
        correct_outcomes.append(interaction.correct)

    # Aggregate metrics
    n = len(correct_outcomes)
    accuracy    = sum(correct_outcomes) / n
    avg_mastery = sum(mastery_predictions) / n

    # Classify the student
    profile_label = _classify_student(accuracy, avg_mastery)

    return ProfileStudentResponse(
        student_id=request.student_id,
        accuracy=round(accuracy, 4),
        avg_mastery=round(avg_mastery, 4),
        profile_label=profile_label,
    )
