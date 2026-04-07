"""Add AI profile columns to users table

Adds two columns to the `users` table to store the student profile label
and average mastery score returned by the KT (Knowledge Tracing) ML
microservice after each completed quiz session:

  current_profile  — String: one of the 5 DKT-GRU profile labels,
                     e.g. "High Achiever", "Struggling", etc.
  avg_mastery      — Float:  mean pre-question mastery probability (0.0–1.0)
                     as predicted by the GRU model.

Revision ID: f7e8d9c0b1a2
Revises: 0a0ca8311677, 303ecb996812
Create Date: 2026-04-07
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# ---------------------------------------------------------------------------
# Revision identifiers
# ---------------------------------------------------------------------------
# This migration merges two existing branch heads so that `alembic upgrade
# head` works even when the migration graph had multiple leaf nodes.
revision: str = "f7e8d9c0b1a2"
down_revision: Union[str, Sequence[str], None] = ("0a0ca8311677", "303ecb996812")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add current_profile and avg_mastery columns to the users table."""

    # current_profile: stores the DKT-GRU label assigned after each quiz.
    # server_default guarantees that all existing rows get a valid value
    # immediately upon migration without requiring a data backfill.
    op.add_column(
        "users",
        sa.Column(
            "current_profile",
            sa.String(),
            server_default="Developing (Average)",
            nullable=False,
        ),
    )

    # avg_mastery: mean pre-question mastery probability from the KT model.
    # Stored as a double-precision float; 0.0 is the correct prior for a
    # student who has not yet been profiled.
    op.add_column(
        "users",
        sa.Column(
            "avg_mastery",
            sa.Float(),
            server_default="0.0",
            nullable=False,
        ),
    )


def downgrade() -> None:
    """Remove current_profile and avg_mastery columns from the users table."""
    op.drop_column("users", "avg_mastery")
    op.drop_column("users", "current_profile")
