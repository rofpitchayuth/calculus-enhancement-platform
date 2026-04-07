"""
config.py
=========
Centralised configuration for the KT microservice.

On import this module resolves all file paths relative to its own location so
the service can be started from any working directory.  It reads two artefact
files produced by save_production_model.py:

  1. dkt_gru_skill_map.json  — contains num_skills, hidden_size, dropout and
                               the skill_map dictionary (used to reconstruct
                               the model with identical dimensions).
  2. dkt_gru_production.pt   — PyTorch state_dict for the trained GRU weights.
  3. best_hyperparameters_5000.json — kept for reference / audit trail.

All paths and parsed values are exposed as module-level constants so that
main.py imports a single, clean namespace.
"""

import json
from pathlib import Path

# ---------------------------------------------------------------------------
# Base directory — the folder that contains this config.py file
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent

# ---------------------------------------------------------------------------
# Artefact file paths
# ---------------------------------------------------------------------------

# Serialised model weights — produced by save_production_model.py
MODEL_WEIGHTS_PATH: Path = BASE_DIR / "dkt_gru_production.pt"

# Skill map + architecture metadata — produced by save_production_model.py
SKILL_MAP_PATH: Path = BASE_DIR / "dkt_gru_skill_map.json"

# Original hyperparameter config (kept for audit / reference)
HYPERPARAMS_PATH: Path = BASE_DIR / "best_hyperparameters_5000.json"

# ---------------------------------------------------------------------------
# Load and validate the skill-map artefact
# ---------------------------------------------------------------------------

if not SKILL_MAP_PATH.exists():
    raise FileNotFoundError(
        f"Skill map artefact not found: {SKILL_MAP_PATH}\n"
        "Run save_production_model.py inside the research environment first, "
        "then copy dkt_gru_skill_map.json and dkt_gru_production.pt here."
    )

with open(SKILL_MAP_PATH, "r", encoding="utf-8") as _f:
    _skill_map_data: dict = json.load(_f)

# skill_map: Dict[str, int]  e.g. {"0": 0, "1": 1, ..., "59": 59}
# Keys are the continuous skill_id strings assigned during training.
SKILL_MAP: dict = _skill_map_data["skill_map"]

# Architectural parameters — MUST match training exactly for state_dict to load
NUM_SKILLS: int   = int(_skill_map_data["num_skills"])
HIDDEN_SIZE: int  = int(_skill_map_data["hidden_size"])
DROPOUT: float    = float(_skill_map_data["dropout"])

# Metadata (informational only)
MODEL_ARCH: str     = _skill_map_data.get("model_arch", "DKTGRUModel")
TRAINED_ON: str     = _skill_map_data.get("trained_on", "unknown")
TRAIN_EPOCHS: int   = int(_skill_map_data.get("epochs", 0))

# Fixed GRU layer count (always 1 in the research configuration)
NUM_LAYERS: int = 1

# ---------------------------------------------------------------------------
# Server / CORS settings
# ---------------------------------------------------------------------------

# The ML service listens on this port to avoid clashing with the main backend
SERVICE_PORT: int = 8001

# Origins permitted to make cross-origin requests to this service.
# The main FastAPI backend (8000) is included so it can call this service from
# browser-initiated requests; localhost:3000 covers the development frontend.
ALLOWED_ORIGINS: list = [
    "http://localhost:8000",   # main backend (production calls)
    "http://localhost:3000",   # React/Next.js dev server (frontend)
    "http://localhost:5173",   # Vite dev server (alternative frontend port)
    "http://127.0.0.1:8000",
    "http://127.0.0.1:3000",
]

# Inference device — CPU keeps the deployment simple; switch to 'cuda' if
# a GPU is available in the production environment.
INFERENCE_DEVICE: str = "cpu"
