from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import (
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
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    agent: Mapped[AgentRecord] = relationship()
