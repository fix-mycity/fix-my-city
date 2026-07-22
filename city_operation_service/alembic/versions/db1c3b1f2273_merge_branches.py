"""merge branches

Revision ID: db1c3b1f2273
Revises: 7a014679d81c, de6d63305366
Create Date: 2026-07-17 08:50:36.724488

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'db1c3b1f2273'
down_revision: Union[str, None] = ('7a014679d81c', 'de6d63305366')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
