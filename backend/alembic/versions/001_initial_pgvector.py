"""Initial schema and pgvector extension

Revision ID: 001_initial_pgvector
Revises: 
Create Date: 2026-09-16 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '001_initial_pgvector'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Enable pgvector extension if running on PostgreSQL
    conn = op.get_bind()
    if conn.dialect.name == 'postgresql':
        op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
        op.execute('CREATE EXTENSION IF NOT EXISTS vector;')

def downgrade():
    conn = op.get_bind()
    if conn.dialect.name == 'postgresql':
        op.execute('DROP EXTENSION IF EXISTS vector;')
