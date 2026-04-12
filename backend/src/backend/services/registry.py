from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from sqlalchemy import select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from backend.db.models import AgentRecord, AgentToolRecord


@dataclass
class SeedAgentTool:
    name: str
    description: str
    image: str
    entrypoint: str
    input_format: str
    output_format: str
    timeout_seconds: int


@dataclass
class SeedAgentRecord:
    slug: str
    name: str
    description: str
    version: str
    schema_version: int
    instructions_markdown: str
    public_instructions: str
    model_provider: str
    model_name: str
    model_temperature: float
    model_max_tokens: int
    runtime_timeout_seconds: int
    runtime_internet_access: bool
    runtime_execution_notes: str | None
    input_mode: str
    output_mode: str
    marketplace_short_pitch: str
    marketplace_price: str
    payment_enabled: bool
    payment_chain: str | None
    payment_currency: str | None
    payment_amount_atomic: int | None
    payment_decimals: int | None
    payment_recipient_address: str | None
    marketplace_trust_badge: str
    marketplace_rating: float
    marketplace_review_count: int
    marketplace_categories: list[str]
    marketplace_featured: bool
    marketplace_use_cases: list[str]
    package_path: str
    example_input_path: str | None
    example_output_path: str | None
    raw_config: dict[str, Any]
    tools: list[SeedAgentTool]


def sync_registry(*, engine: Engine, agents: list[SeedAgentRecord]) -> None:
    with Session(engine) as session:
        existing = {
            record.slug: record
            for record in session.execute(select(AgentRecord)).scalars().all()
        }
        seen_slugs: set[str] = set()

        for agent in agents:
            seen_slugs.add(agent.slug)
            record = existing.get(agent.slug)

            if record is None:
                record = AgentRecord(slug=agent.slug)
                session.add(record)

            hydrate_agent_record(record, agent)

        for slug, record in existing.items():
            if slug not in seen_slugs:
                session.delete(record)

        session.commit()


def hydrate_agent_record(record: AgentRecord, agent: SeedAgentRecord) -> None:
    record.name = agent.name
    record.description = agent.description
    record.version = agent.version
    record.schema_version = agent.schema_version
    record.instructions_markdown = agent.instructions_markdown
    record.public_instructions = agent.public_instructions
    record.model_provider = agent.model_provider
    record.model_name = agent.model_name
    record.model_temperature = agent.model_temperature
    record.model_max_tokens = agent.model_max_tokens
    record.runtime_timeout_seconds = agent.runtime_timeout_seconds
    record.runtime_internet_access = agent.runtime_internet_access
    record.runtime_execution_notes = agent.runtime_execution_notes
    record.input_mode = agent.input_mode
    record.output_mode = agent.output_mode
    record.marketplace_short_pitch = agent.marketplace_short_pitch
    record.marketplace_price = agent.marketplace_price
    record.payment_enabled = agent.payment_enabled
    record.payment_chain = agent.payment_chain
    record.payment_currency = agent.payment_currency
    record.payment_amount_atomic = agent.payment_amount_atomic
    record.payment_decimals = agent.payment_decimals
    record.payment_recipient_address = agent.payment_recipient_address
    record.marketplace_trust_badge = agent.marketplace_trust_badge
    record.marketplace_rating = agent.marketplace_rating
    record.marketplace_review_count = agent.marketplace_review_count
    record.marketplace_categories = agent.marketplace_categories
    record.marketplace_featured = agent.marketplace_featured
    record.marketplace_use_cases = agent.marketplace_use_cases
    record.package_path = agent.package_path
    record.example_input_path = agent.example_input_path
    record.example_output_path = agent.example_output_path
    record.raw_config = agent.raw_config

    existing_tools = {tool.name: tool for tool in record.tools}
    seen_tool_names: set[str] = set()

    for tool in agent.tools:
        seen_tool_names.add(tool.name)
        tool_record = existing_tools.get(tool.name)

        if tool_record is None:
            record.tools.append(
                AgentToolRecord(
                    name=tool.name,
                    description=tool.description,
                    image=tool.image,
                    entrypoint=tool.entrypoint,
                    input_format=tool.input_format,
                    output_format=tool.output_format,
                    timeout_seconds=tool.timeout_seconds,
                )
            )
            continue

        tool_record.description = tool.description
        tool_record.image = tool.image
        tool_record.entrypoint = tool.entrypoint
        tool_record.input_format = tool.input_format
        tool_record.output_format = tool.output_format
        tool_record.timeout_seconds = tool.timeout_seconds

    for tool_record in list(record.tools):
        if tool_record.name not in seen_tool_names:
            record.tools.remove(tool_record)
