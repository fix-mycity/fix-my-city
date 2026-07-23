"""merge split heads

Revision ID: edd37758a6f5
Revises: c97f4f6e12a8, 484bffd656e4
Create Date: 2026-07-23 06:20:43.138722

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'edd37758a6f5'
down_revision: Union[str, None] = ('c97f4f6e12a8', '484bffd656e4')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
