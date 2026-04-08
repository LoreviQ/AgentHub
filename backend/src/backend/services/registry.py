from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, cast

import jsonschema
import yaml
from sqlalchemy import select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from backend.core.config import Settings
from backend.db.models import AgentRecord, AgentToolRecord
from backend.schemas.package import AgentPackageConfig


class RegistryValidationError(RuntimeError):
    pass


@dataclass
class ParsedAgentPackage:
    directory: Path
    config: AgentPackageConfig
    instructions_markdown: str
    example_input_path: Path | None
    example_output_path: Path | None
    raw_config: dict[str, Any]


def sync_registry(*, engine: Engine, settings: Settings) -> None:
    packages = load_agent_packages(settings.agents_dir, settings.schema_path)

    with Session(engine) as session:
        existing = {
            record.slug: record
            for record in session.execute(select(AgentRecord)).scalars().all()
        }
        seen_slugs: set[str] = set()

        for package in packages:
            slug = package.config.id
            seen_slugs.add(slug)
            record = existing.get(slug)

            if record is None:
                record = AgentRecord(slug=slug)
                session.add(record)

            hydrate_agent_record(record, package)

        for slug, record in existing.items():
            if slug not in seen_slugs:
                session.delete(record)

        session.commit()


def load_agent_packages(
    agents_dir: Path, schema_path: Path
) -> list[ParsedAgentPackage]:
    schema = cast(dict[str, Any], json.loads(schema_path.read_text(encoding="utf-8")))
    packages: list[ParsedAgentPackage] = []

    for directory in sorted(path for path in agents_dir.iterdir() if path.is_dir()):
        if directory.name.startswith("_"):
            continue

        config_path = directory / "agent.yaml"
        markdown_path = directory / "agent.md"
        if not config_path.exists() or not markdown_path.exists():
            raise RegistryValidationError(
                f"Agent package '{directory.name}' is missing required files."
            )

        loaded_config = yaml.safe_load(config_path.read_text(encoding="utf-8"))
        if not isinstance(loaded_config, dict):
            raise RegistryValidationError(
                f"Agent package '{directory.name}' has an invalid YAML object."
            )

        raw_config = cast(dict[str, Any], loaded_config)
        try:
            jsonschema.validate(raw_config, schema)
        except jsonschema.ValidationError as exc:
            raise RegistryValidationError(
                f"Agent package '{directory.name}' failed schema validation: {exc.message}"
            ) from exc

        config = AgentPackageConfig.model_validate(raw_config)

        if config.id != directory.name:
            raise RegistryValidationError(
                f"Agent package '{directory.name}' has mismatched id '{config.id}'."
            )

        packages.append(
            ParsedAgentPackage(
                directory=directory,
                config=config,
                instructions_markdown=markdown_path.read_text(encoding="utf-8"),
                example_input_path=_optional_file(directory / "example-input.txt"),
                example_output_path=_optional_file(
                    directory / "example-response.json",
                    directory / "example-output.md",
                ),
                raw_config=raw_config,
            )
        )

    return packages


def hydrate_agent_record(record: AgentRecord, package: ParsedAgentPackage) -> None:
    config = package.config
    record.name = config.name
    record.description = config.description
    record.version = config.version
    record.schema_version = config.schema_version
    record.instructions_markdown = package.instructions_markdown
    record.public_instructions = config.public_instructions
    record.model_provider = config.model.provider
    record.model_name = config.model.name
    record.model_temperature = config.model.temperature
    record.model_max_tokens = config.model.max_tokens
    record.runtime_timeout_seconds = config.runtime.timeout_seconds
    record.runtime_internet_access = config.runtime.internet_access
    record.runtime_execution_notes = config.runtime.execution_notes
    record.input_mode = config.io.input_mode
    record.output_mode = config.io.output_mode
    record.package_path = str(package.directory)
    record.example_input_path = (
        str(package.example_input_path) if package.example_input_path else None
    )
    record.example_output_path = (
        str(package.example_output_path) if package.example_output_path else None
    )
    record.raw_config = package.raw_config

    existing_tools = {tool.name: tool for tool in record.tools}
    seen_tool_names: set[str] = set()

    for tool in config.tools.items:
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


def _optional_file(*paths: Path) -> Path | None:
    for path in paths:
        if path.exists():
            return path
    return None
