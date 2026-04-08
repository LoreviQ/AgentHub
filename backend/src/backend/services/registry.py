from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import jsonschema
import yaml
from sqlalchemy import select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from backend.core.config import Settings
from backend.db.models import AgentRecord, AgentToolRecord


class RegistryValidationError(RuntimeError):
    pass


@dataclass
class ParsedAgentPackage:
    directory: Path
    config: dict
    instructions_markdown: str
    example_input_path: Path | None
    example_output_path: Path | None


def sync_registry(*, engine: Engine, settings: Settings) -> None:
    packages = load_agent_packages(settings.agents_dir, settings.schema_path)

    with Session(engine) as session:
        existing = {
            record.slug: record
            for record in session.execute(select(AgentRecord)).scalars().all()
        }
        seen_slugs: set[str] = set()

        for package in packages:
            slug = package.config["id"]
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


def load_agent_packages(agents_dir: Path, schema_path: Path) -> list[ParsedAgentPackage]:
    schema = json.loads(schema_path.read_text(encoding="utf-8"))
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

        config = yaml.safe_load(config_path.read_text(encoding="utf-8"))
        try:
            jsonschema.validate(config, schema)
        except jsonschema.ValidationError as exc:
            raise RegistryValidationError(
                f"Agent package '{directory.name}' failed schema validation: {exc.message}"
            ) from exc

        if config["id"] != directory.name:
            raise RegistryValidationError(
                f"Agent package '{directory.name}' has mismatched id '{config['id']}'."
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
            )
        )

    return packages


def hydrate_agent_record(record: AgentRecord, package: ParsedAgentPackage) -> None:
    config = package.config
    record.name = config["name"]
    record.description = config["description"]
    record.version = config["version"]
    record.schema_version = config["schema_version"]
    record.instructions_markdown = package.instructions_markdown
    record.public_instructions = config["public_instructions"]
    record.model_provider = config["model"]["provider"]
    record.model_name = config["model"]["name"]
    record.model_temperature = config["model"]["temperature"]
    record.model_max_tokens = config["model"]["max_tokens"]
    record.runtime_timeout_seconds = config["runtime"]["timeout_seconds"]
    record.runtime_internet_access = config["runtime"]["internet_access"]
    record.runtime_execution_notes = config["runtime"].get("execution_notes")
    record.input_mode = config["io"]["input_mode"]
    record.output_mode = config["io"]["output_mode"]
    record.package_path = str(package.directory)
    record.example_input_path = str(package.example_input_path) if package.example_input_path else None
    record.example_output_path = (
        str(package.example_output_path) if package.example_output_path else None
    )
    record.raw_config = config

    record.tools.clear()
    for tool in config["tools"]["items"]:
        record.tools.append(
            AgentToolRecord(
                name=tool["name"],
                description=tool["description"],
                image=tool["image"],
                entrypoint=tool["entrypoint"],
                input_format=tool["input_format"],
                output_format=tool["output_format"],
                timeout_seconds=tool["timeout_seconds"],
            )
        )


def _optional_file(*paths: Path) -> Path | None:
    for path in paths:
        if path.exists():
            return path
    return None
