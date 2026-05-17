"""add_new_subtopics_to_enum

Revision ID: ec1e60b1d325
Revises: 497d0541bff6
Create Date: 2026-05-17 14:52:52.786607

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ec1e60b1d325'
down_revision: Union[str, Sequence[str], None] = '497d0541bff6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE subtopic ADD VALUE IF NOT EXISTS 'ALGEBRAIC_LIMITS'")
        op.execute("ALTER TYPE subtopic ADD VALUE IF NOT EXISTS 'TRIG_LIMITS'")
        op.execute("ALTER TYPE subtopic ADD VALUE IF NOT EXISTS 'IMPLICIT_DIFF'")
        op.execute("ALTER TYPE subtopic ADD VALUE IF NOT EXISTS 'IMPLICIT_FUNCTIONS'")
        op.execute("ALTER TYPE subtopic ADD VALUE IF NOT EXISTS 'HIGHER_ORDER_DERIV'")
        op.execute("ALTER TYPE subtopic ADD VALUE IF NOT EXISTS 'APP_OF_DERIVATIVES'")
        op.execute("ALTER TYPE subtopic ADD VALUE IF NOT EXISTS 'OPTIMIZATION'")
        op.execute("ALTER TYPE subtopic ADD VALUE IF NOT EXISTS 'RELATED_RATES'")
        op.execute("ALTER TYPE subtopic ADD VALUE IF NOT EXISTS 'INTEGRATION_TECHNIQUES'")
        op.execute("ALTER TYPE subtopic ADD VALUE IF NOT EXISTS 'SUBSTITUTION'")
        op.execute("ALTER TYPE subtopic ADD VALUE IF NOT EXISTS 'ADV_INTEGRATION'")
        op.execute("ALTER TYPE subtopic ADD VALUE IF NOT EXISTS 'TRIG_FUNCTIONS'")
        op.execute("ALTER TYPE subtopic ADD VALUE IF NOT EXISTS 'TRIG_IDENTITIES'")


def downgrade() -> None:
    """Downgrade schema."""
    pass
