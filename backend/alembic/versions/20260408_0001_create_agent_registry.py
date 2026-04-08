"""create agent registry tables"""

from alembic import op
import sqlalchemy as sa


revision = "20260408_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "agents",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("version", sa.String(length=32), nullable=False),
        sa.Column("schema_version", sa.Integer(), nullable=False),
        sa.Column("instructions_markdown", sa.Text(), nullable=False),
        sa.Column("public_instructions", sa.Text(), nullable=False),
        sa.Column("model_provider", sa.String(length=255), nullable=False),
        sa.Column("model_name", sa.String(length=255), nullable=False),
        sa.Column("model_temperature", sa.Float(), nullable=False),
        sa.Column("model_max_tokens", sa.Integer(), nullable=False),
        sa.Column("runtime_timeout_seconds", sa.Integer(), nullable=False),
        sa.Column("runtime_internet_access", sa.Boolean(), nullable=False),
        sa.Column("runtime_execution_notes", sa.Text(), nullable=True),
        sa.Column("input_mode", sa.String(length=32), nullable=False),
        sa.Column("output_mode", sa.String(length=32), nullable=False),
        sa.Column("package_path", sa.String(length=1024), nullable=False),
        sa.Column("example_input_path", sa.String(length=1024), nullable=True),
        sa.Column("example_output_path", sa.String(length=1024), nullable=True),
        sa.Column("raw_config", sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_agents_slug"), "agents", ["slug"], unique=True)
    op.create_table(
        "agent_tools",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("agent_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("image", sa.String(length=1024), nullable=False),
        sa.Column("entrypoint", sa.String(length=1024), nullable=False),
        sa.Column("input_format", sa.String(length=32), nullable=False),
        sa.Column("output_format", sa.String(length=32), nullable=False),
        sa.Column("timeout_seconds", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["agent_id"], ["agents.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("agent_id", "name", name="uq_agent_tool_name"),
    )
    op.create_index(op.f("ix_agent_tools_agent_id"), "agent_tools", ["agent_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_agent_tools_agent_id"), table_name="agent_tools")
    op.drop_table("agent_tools")
    op.drop_index(op.f("ix_agents_slug"), table_name="agents")
    op.drop_table("agents")
