"""add agent run records"""

from alembic import op
import sqlalchemy as sa


revision = "20260408_0002"
down_revision = "20260408_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "agent_runs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("agent_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("provider", sa.String(length=255), nullable=False),
        sa.Column("model_name", sa.String(length=255), nullable=False),
        sa.Column("input_payload", sa.JSON(), nullable=False),
        sa.Column("output_payload", sa.JSON(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["agent_id"], ["agents.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_agent_runs_agent_id"), "agent_runs", ["agent_id"], unique=False)
    op.create_index(op.f("ix_agent_runs_status"), "agent_runs", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_agent_runs_status"), table_name="agent_runs")
    op.drop_index(op.f("ix_agent_runs_agent_id"), table_name="agent_runs")
    op.drop_table("agent_runs")
