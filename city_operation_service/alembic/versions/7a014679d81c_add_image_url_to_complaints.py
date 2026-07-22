"""add_image_url_to_complaints

Revision ID: 7a014679d81c
Revises: 
Create Date: 2026-07-15 07:11:13.097974

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a014679d81c'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass
    # ### end Alembic commands ###


def downgrade() -> None:
    pass
    # ### end Alembic commands ###
