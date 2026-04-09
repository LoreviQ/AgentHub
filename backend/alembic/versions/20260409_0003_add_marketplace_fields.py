"""add marketplace fields to agents"""

from alembic import op
import sqlalchemy as sa


revision = "20260409_0003"
down_revision = "20260408_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("agents", sa.Column("marketplace_short_pitch", sa.Text(), nullable=True))
    op.add_column("agents", sa.Column("marketplace_price", sa.String(length=255), nullable=True))
    op.add_column(
        "agents", sa.Column("marketplace_trust_badge", sa.String(length=255), nullable=True)
    )
    op.add_column("agents", sa.Column("marketplace_rating", sa.Float(), nullable=True))
    op.add_column("agents", sa.Column("marketplace_review_count", sa.Integer(), nullable=True))
    op.add_column("agents", sa.Column("marketplace_categories", sa.JSON(), nullable=True))
    op.add_column("agents", sa.Column("marketplace_featured", sa.Boolean(), nullable=True))
    op.add_column("agents", sa.Column("marketplace_use_cases", sa.JSON(), nullable=True))

    connection = op.get_bind()
    agents = sa.table(
        "agents",
        sa.column("id", sa.Integer()),
        sa.column("description", sa.Text()),
        sa.column("marketplace_short_pitch", sa.Text()),
        sa.column("marketplace_price", sa.String(length=255)),
        sa.column("marketplace_trust_badge", sa.String(length=255)),
        sa.column("marketplace_rating", sa.Float()),
        sa.column("marketplace_review_count", sa.Integer()),
        sa.column("marketplace_categories", sa.JSON()),
        sa.column("marketplace_featured", sa.Boolean()),
        sa.column("marketplace_use_cases", sa.JSON()),
    )
    rows = connection.execute(sa.select(agents.c.id, agents.c.description)).all()
    for row in rows:
        connection.execute(
            agents.update()
            .where(agents.c.id == row.id)
            .values(
                marketplace_short_pitch=row.description,
                marketplace_price="Unspecified",
                marketplace_trust_badge="Unspecified",
                marketplace_rating=0.0,
                marketplace_review_count=0,
                marketplace_categories=["General"],
                marketplace_featured=False,
                marketplace_use_cases=[row.description],
            )
        )

    with op.batch_alter_table("agents") as batch_op:
        batch_op.alter_column("marketplace_short_pitch", nullable=False)
        batch_op.alter_column("marketplace_price", nullable=False)
        batch_op.alter_column("marketplace_trust_badge", nullable=False)
        batch_op.alter_column("marketplace_rating", nullable=False)
        batch_op.alter_column("marketplace_review_count", nullable=False)
        batch_op.alter_column("marketplace_categories", nullable=False)
        batch_op.alter_column("marketplace_featured", nullable=False)
        batch_op.alter_column("marketplace_use_cases", nullable=False)


def downgrade() -> None:
    with op.batch_alter_table("agents") as batch_op:
        batch_op.drop_column("marketplace_use_cases")
        batch_op.drop_column("marketplace_featured")
        batch_op.drop_column("marketplace_categories")
        batch_op.drop_column("marketplace_review_count")
        batch_op.drop_column("marketplace_rating")
        batch_op.drop_column("marketplace_trust_badge")
        batch_op.drop_column("marketplace_price")
        batch_op.drop_column("marketplace_short_pitch")
