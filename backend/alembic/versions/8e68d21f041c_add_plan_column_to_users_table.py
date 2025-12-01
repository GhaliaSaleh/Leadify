"""Add plan column to users table

Revision ID: 8e68d21f041c
Revises: 9f6b6208f0f9
Create Date: 2025-07-12 19:18:43.091254

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8e68d21f041c'
down_revision: Union[str, Sequence[str], None] = '9f6b6208f0f9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Step 1: Create the new ENUM type first
    plan_enum = sa.Enum('FREE', 'PRO', 'BUSINESS', name='planenum')
    plan_enum.create(op.get_bind(), checkfirst=False)
    
    # Step 2: Now, add the column using the newly created type
    op.add_column('users', sa.Column('plan', plan_enum, server_default='FREE', nullable=False))


def downgrade() -> None:
    # Step 1: Drop the column first
    op.drop_column('users', 'plan')
    
    # Step 2: Then, drop the ENUM type
    plan_enum = sa.Enum('FREE', 'PRO', 'BUSINESS', name='planenum')
    plan_enum.drop(op.get_bind())
