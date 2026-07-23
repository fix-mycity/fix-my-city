"""add_media_status_to_complaints

Revision ID: c97f4f6e12a8
Revises: 427efe237a1b
Create Date: 2026-07-22 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c97f4f6e12a8'
down_revision: Union[str, None] = '427efe237a1b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = [c['name'] for c in inspector.get_columns('complaints')]
    if 'media_status' not in columns:
        op.add_column('complaints', sa.Column('media_status', sa.String(length=50), nullable=True))
    
    indexes = [idx['name'] for idx in inspector.get_indexes('complaints')]
    if 'ix_complaints_media_status' not in indexes:
        op.create_index(op.f('ix_complaints_media_status'), 'complaints', ['media_status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_complaints_media_status'), table_name='complaints')
    op.drop_column('complaints', 'media_status')
