"""
models/dkt_gru.py
=================
Self-contained Deep Knowledge Tracing — GRU variant.

This module contains ONLY the neural-network architecture and an inference
wrapper.  All training-related code (optimizer, DataLoader, loss, etc.) has
been intentionally removed.  The production service performs pure inference:
it encodes an incoming sequence of interactions, runs a GRU forward pass, and
returns a mastery probability.

Architecture overview
---------------------
  Input  : one-hot encoded (skill, correctness) pairs
           shape = (batch=1, seq_len, num_skills * 2)
  GRU    : hidden_size units, configurable layers and dropout
  Output : sigmoid-activated per-skill correctness probability
           shape = (batch=1, seq_len, num_skills)

At inference, we read the prediction at the LAST time-step for the
target_skill_id — this represents the model's current estimate of mastery
given the full history provided.
"""

import numpy as np
import torch
import torch.nn as nn
from typing import Dict, List, Optional


# ---------------------------------------------------------------------------
# 1.  Neural-network module (mirrors the research architecture exactly)
# ---------------------------------------------------------------------------

class DKTGRUModel(nn.Module):
    """
    GRU-based Deep Knowledge Tracing neural network.

    Topology is intentionally identical to the research version
    (knowledge-tracing-research/bkt_experiments/models/deep/dkt_gru.py)
    so that the saved state_dict loads without key mismatches.
    """

    def __init__(
        self,
        num_skills: int,
        hidden_size: int = 64,
        num_layers: int = 1,
        dropout: float = 0.394,
    ):
        """
        Args:
            num_skills:  Total number of distinct skills / question types.
            hidden_size: Dimensionality of the GRU hidden state.
            num_layers:  Number of stacked GRU layers.
            dropout:     Dropout probability applied after the GRU.
                         Note: PyTorch GRU only applies inter-layer dropout
                         when num_layers > 1; the post-GRU Dropout layer is
                         always active during training.
        """
        super(DKTGRUModel, self).__init__()

        self.num_skills = num_skills
        self.hidden_size = hidden_size
        self.num_layers = num_layers

        # Input encoding: one-hot vector of size (num_skills * 2)
        # Each skill contributes two dimensions: [skill_incorrect, skill_correct]
        input_size = num_skills * 2

        # GRU recurrent layer
        self.gru = nn.GRU(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            # Inter-layer dropout is only meaningful with multiple layers
            dropout=dropout if num_layers > 1 else 0,
        )

        # Post-GRU dropout (regularisation — kept in eval mode it is a no-op)
        self.dropout = nn.Dropout(dropout)

        # Linear projection: hidden_size → num_skills
        self.fc = nn.Linear(hidden_size, num_skills)

        # Sigmoid squashes logits to [0, 1] mastery probabilities
        self.sigmoid = nn.Sigmoid()

    def forward(
        self,
        x: torch.Tensor,
        hidden: Optional[torch.Tensor] = None,
    ):
        """
        Forward pass.

        Args:
            x:      Input tensor of shape (batch, seq_len, num_skills * 2).
            hidden: Optional initial hidden state.

        Returns:
            predictions: (batch, seq_len, num_skills) — per-skill mastery probs.
            hidden:      Final GRU hidden state.
        """
        gru_out, hidden = self.gru(x, hidden)
        gru_out = self.dropout(gru_out)
        logits = self.fc(gru_out)
        predictions = self.sigmoid(logits)
        return predictions, hidden


# ---------------------------------------------------------------------------
# 2.  Inference wrapper used directly by the FastAPI endpoints
# ---------------------------------------------------------------------------

class DKTGRUInference:
    """
    High-level inference wrapper around DKTGRUModel.

    Responsibilities:
      - Hold the loaded nn.Module in evaluation mode.
      - Maintain the skill_map so that skill_id strings from API requests
        are mapped to the correct integer indices (matching training-time
        encoding).
      - Expose a single public method: predict_mastery().

    The wrapper never trains; it only calls model.eval() + torch.no_grad().
    """

    def __init__(
        self,
        num_skills: int,
        hidden_size: int,
        dropout: float,
        skill_map: Dict[str, int],
        num_layers: int = 1,
        device: str = "cpu",
    ):
        """
        Args:
            num_skills:  Must match the value used during training.
            hidden_size: Must match the value used during training.
            dropout:     Same dropout rate as training (inactive in eval mode).
            skill_map:   Dict mapping skill_id string → integer index.
                         This MUST be the exact map saved by save_production_model.py.
            num_layers:  Number of GRU layers (default 1, matching research config).
            device:      'cpu' or 'cuda'.
        """
        self.skill_map = skill_map
        self.num_skills = num_skills
        self.device = device

        # Build and store the model (weights loaded separately via load_weights)
        self.model = DKTGRUModel(
            num_skills=num_skills,
            hidden_size=hidden_size,
            num_layers=num_layers,
            dropout=dropout,
        ).to(device)

        # Start in eval mode — this disables dropout and batch-norm updates
        self.model.eval()

    def load_weights(self, state_dict_path: str) -> None:
        """
        Load a serialised state_dict from disk into the model.

        Args:
            state_dict_path: Absolute or relative path to the .pt file
                             produced by save_production_model.py.

        Raises:
            FileNotFoundError: If the .pt file does not exist.
            RuntimeError:      If the state_dict keys do not match the model.
        """
        import os
        if not os.path.exists(state_dict_path):
            raise FileNotFoundError(
                f"Trained model weights not found at: {state_dict_path}\n"
                "Run save_production_model.py first to generate the .pt file."
            )

        state_dict = torch.load(state_dict_path, map_location=self.device)
        self.model.load_state_dict(state_dict)

        # Re-confirm eval mode after loading weights
        self.model.eval()

    def predict_mastery(
        self,
        history: List[Dict],
        target_skill_id: str,
    ) -> float:
        """
        Predict the probability that a student answers a question on
        target_skill_id correctly, given their interaction history.

        The history is encoded as a one-hot sequence and fed through the GRU.
        The prediction at the LAST time-step for target_skill_id is returned.

        Args:
            history:         List of dicts, each with keys:
                               'skill_id' (str) — the skill attempted
                               'correct'  (int) — 1 if correct, 0 if not
            target_skill_id: The skill for which mastery is predicted.

        Returns:
            Float in [0.0, 1.0] — estimated probability of correct response.
            Returns 0.5 (uncertain prior) if history is empty or the
            target_skill_id is not in the known skill vocabulary.
        """
        # Edge case: no history → return neutral prior
        if not history:
            return 0.5

        # Edge case: unknown target skill
        if target_skill_id not in self.skill_map:
            return 0.5

        seq_len = len(history)
        input_dim = self.num_skills * 2

        # Build the one-hot encoded input tensor
        inputs = np.zeros((1, seq_len, input_dim), dtype=np.float32)

        for t, interaction in enumerate(history):
            skill_id = str(interaction["skill_id"])
            if skill_id not in self.skill_map:
                # Unknown skill in history — leave row as zeros (padding)
                continue

            skill_idx = self.skill_map[skill_id]
            offset = skill_idx * 2

            if int(interaction["correct"]) == 1:
                inputs[0, t, offset + 1] = 1.0  # correct channel
            else:
                inputs[0, t, offset] = 1.0       # incorrect channel

        # Run the GRU forward pass (no gradient computation needed)
        with torch.no_grad():
            inputs_tensor = torch.FloatTensor(inputs).to(self.device)
            predictions, _ = self.model(inputs_tensor)

        # Extract the prediction for the target skill at the last time-step
        target_idx = self.skill_map[target_skill_id]
        mastery_prob = predictions[0, -1, target_idx].item()

        # Clip to valid probability range and return
        return float(np.clip(mastery_prob, 0.0, 1.0))
