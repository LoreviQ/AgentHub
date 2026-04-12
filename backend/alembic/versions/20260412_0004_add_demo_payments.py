"""add demo payment metadata and sessions"""

from alembic import op
import sqlalchemy as sa


revision = "20260412_0004"
down_revision = "20260409_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("agents") as batch_op:
        batch_op.add_column(
            sa.Column("payment_enabled", sa.Boolean(), nullable=False, server_default=sa.false())
        )
        batch_op.add_column(sa.Column("payment_chain", sa.String(length=64), nullable=True))
        batch_op.add_column(sa.Column("payment_currency", sa.String(length=16), nullable=True))
        batch_op.add_column(sa.Column("payment_amount_atomic", sa.BigInteger(), nullable=True))
        batch_op.add_column(sa.Column("payment_decimals", sa.Integer(), nullable=True))
        batch_op.add_column(
            sa.Column("payment_recipient_address", sa.String(length=255), nullable=True)
        )

    op.create_table(
        "payment_sessions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("wallet_address", sa.String(length=255), nullable=False),
        sa.Column("label", sa.String(length=255), nullable=True),
        sa.Column("chain", sa.String(length=64), nullable=False),
        sa.Column("currency", sa.String(length=16), nullable=False),
        sa.Column("budget_atomic", sa.BigInteger(), nullable=False),
        sa.Column("spent_atomic", sa.BigInteger(), nullable=False),
        sa.Column("decimals", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("metadata_json", sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_payment_sessions_token_hash"), "payment_sessions", ["token_hash"], unique=True)
    op.create_index(
        op.f("ix_payment_sessions_wallet_address"),
        "payment_sessions",
        ["wallet_address"],
        unique=False,
    )
    op.create_index(op.f("ix_payment_sessions_status"), "payment_sessions", ["status"], unique=False)

    with op.batch_alter_table("agent_runs") as batch_op:
        batch_op.add_column(sa.Column("payment_session_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("payment_status", sa.String(length=32), nullable=True))
        batch_op.add_column(sa.Column("payment_chain", sa.String(length=64), nullable=True))
        batch_op.add_column(sa.Column("payment_currency", sa.String(length=16), nullable=True))
        batch_op.add_column(sa.Column("payment_amount_atomic", sa.BigInteger(), nullable=True))
        batch_op.add_column(sa.Column("payment_decimals", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("payment_recipient_address", sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column("payment_transaction_hash", sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column("payment_error_message", sa.Text(), nullable=True))
        batch_op.add_column(sa.Column("payment_settled_at", sa.DateTime(timezone=True), nullable=True))
        batch_op.create_index(op.f("ix_agent_runs_payment_session_id"), ["payment_session_id"], unique=False)
        batch_op.create_index(op.f("ix_agent_runs_payment_status"), ["payment_status"], unique=False)
        batch_op.create_foreign_key(
            "fk_agent_runs_payment_session_id",
            "payment_sessions",
            ["payment_session_id"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade() -> None:
    with op.batch_alter_table("agent_runs") as batch_op:
        batch_op.drop_constraint("fk_agent_runs_payment_session_id", type_="foreignkey")
        batch_op.drop_index(op.f("ix_agent_runs_payment_status"))
        batch_op.drop_index(op.f("ix_agent_runs_payment_session_id"))
        batch_op.drop_column("payment_settled_at")
        batch_op.drop_column("payment_error_message")
        batch_op.drop_column("payment_transaction_hash")
        batch_op.drop_column("payment_recipient_address")
        batch_op.drop_column("payment_decimals")
        batch_op.drop_column("payment_amount_atomic")
        batch_op.drop_column("payment_currency")
        batch_op.drop_column("payment_chain")
        batch_op.drop_column("payment_status")
        batch_op.drop_column("payment_session_id")

    op.drop_index(op.f("ix_payment_sessions_status"), table_name="payment_sessions")
    op.drop_index(op.f("ix_payment_sessions_wallet_address"), table_name="payment_sessions")
    op.drop_index(op.f("ix_payment_sessions_token_hash"), table_name="payment_sessions")
    op.drop_table("payment_sessions")

    with op.batch_alter_table("agents") as batch_op:
        batch_op.drop_column("payment_recipient_address")
        batch_op.drop_column("payment_decimals")
        batch_op.drop_column("payment_amount_atomic")
        batch_op.drop_column("payment_currency")
        batch_op.drop_column("payment_chain")
        batch_op.drop_column("payment_enabled")
