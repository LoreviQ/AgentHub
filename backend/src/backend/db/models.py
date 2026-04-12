from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import (
    BigInteger,
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db.base import Base


class AgentRecord(Base):
    __tablename__ = "agents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    version: Mapped[str] = mapped_column(String(32))
    schema_version: Mapped[int] = mapped_column(Integer)
    instructions_markdown: Mapped[str] = mapped_column(Text)
    public_instructions: Mapped[str] = mapped_column(Text)
    model_provider: Mapped[str] = mapped_column(String(255))
    model_name: Mapped[str] = mapped_column(String(255))
    model_temperature: Mapped[float] = mapped_column(Float)
    model_max_tokens: Mapped[int] = mapped_column(Integer)
    runtime_timeout_seconds: Mapped[int] = mapped_column(Integer)
    runtime_internet_access: Mapped[bool] = mapped_column(Boolean, default=False)
    runtime_execution_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    input_mode: Mapped[str] = mapped_column(String(32))
    output_mode: Mapped[str] = mapped_column(String(32))
    marketplace_short_pitch: Mapped[str] = mapped_column(Text)
    marketplace_price: Mapped[str] = mapped_column(String(255))
    payment_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    payment_chain: Mapped[str | None] = mapped_column(String(64), nullable=True)
    payment_currency: Mapped[str | None] = mapped_column(String(16), nullable=True)
    payment_amount_atomic: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    payment_decimals: Mapped[int | None] = mapped_column(Integer, nullable=True)
    payment_recipient_address: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    marketplace_trust_badge: Mapped[str] = mapped_column(String(255))
    marketplace_rating: Mapped[float] = mapped_column(Float)
    marketplace_review_count: Mapped[int] = mapped_column(Integer)
    marketplace_categories: Mapped[list[str]] = mapped_column(JSON)
    marketplace_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    marketplace_use_cases: Mapped[list[str]] = mapped_column(JSON)
    package_path: Mapped[str] = mapped_column(String(1024))
    example_input_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    example_output_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    raw_config: Mapped[dict[str, Any]] = mapped_column(JSON)

    tools: Mapped[list[AgentToolRecord]] = relationship(
        back_populates="agent",
        cascade="all, delete-orphan",
        order_by="AgentToolRecord.name",
    )


class AgentToolRecord(Base):
    __tablename__ = "agent_tools"
    __table_args__ = (UniqueConstraint("agent_id", "name", name="uq_agent_tool_name"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    agent_id: Mapped[int] = mapped_column(
        ForeignKey("agents.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    image: Mapped[str] = mapped_column(String(1024))
    entrypoint: Mapped[str] = mapped_column(String(1024))
    input_format: Mapped[str] = mapped_column(String(32))
    output_format: Mapped[str] = mapped_column(String(32))
    timeout_seconds: Mapped[int] = mapped_column(Integer)

    agent: Mapped[AgentRecord] = relationship(back_populates="tools")


class AgentRunRecord(Base):
    __tablename__ = "agent_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    agent_id: Mapped[int] = mapped_column(
        ForeignKey("agents.id", ondelete="CASCADE"), index=True
    )
    status: Mapped[str] = mapped_column(String(32), index=True)
    provider: Mapped[str] = mapped_column(String(255))
    model_name: Mapped[str] = mapped_column(String(255))
    input_payload: Mapped[dict[str, Any]] = mapped_column(JSON)
    output_payload: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    payment_session_id: Mapped[int | None] = mapped_column(
        ForeignKey("payment_sessions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    payment_status: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)
    payment_chain: Mapped[str | None] = mapped_column(String(64), nullable=True)
    payment_currency: Mapped[str | None] = mapped_column(String(16), nullable=True)
    payment_amount_atomic: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    payment_decimals: Mapped[int | None] = mapped_column(Integer, nullable=True)
    payment_recipient_address: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    payment_transaction_hash: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    payment_error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    payment_settled_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    agent: Mapped[AgentRecord] = relationship()
    payment_session: Mapped[PaymentSessionRecord | None] = relationship()


class PaymentSessionRecord(Base):
    __tablename__ = "payment_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    wallet_address: Mapped[str] = mapped_column(String(255), index=True)
    label: Mapped[str | None] = mapped_column(String(255), nullable=True)
    chain: Mapped[str] = mapped_column(String(64))
    currency: Mapped[str] = mapped_column(String(16))
    budget_atomic: Mapped[int] = mapped_column(BigInteger)
    spent_atomic: Mapped[int] = mapped_column(BigInteger, default=0)
    decimals: Mapped[int] = mapped_column(Integer, default=18)
    status: Mapped[str] = mapped_column(String(32), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
