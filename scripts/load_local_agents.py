from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any, cast

import jsonschema
import yaml

REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_SRC = REPO_ROOT / "backend" / "src"
if str(BACKEND_SRC) not in sys.path:
    sys.path.insert(0, str(BACKEND_SRC))

from backend.db.session import get_engine  # noqa: E402
from backend.schemas.package import AgentPackageConfig  # noqa: E402
from backend.services.registry import (  # noqa: E402
    SeedAgentRecord,
    SeedAgentTool,
    sync_registry,
)


class RegistryValidationError(RuntimeError):
    pass


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Load local example agent packages into the AgentHub database."
    )
    parser.add_argument("--agents-dir", type=Path, required=True)
    parser.add_argument("--schema-path", type=Path, required=True)
    args = parser.parse_args()

    agents = load_agent_packages(args.agents_dir, args.schema_path)
    sync_registry(engine=get_engine(), agents=agents)


def load_agent_packages(agents_dir: Path, schema_path: Path) -> list[SeedAgentRecord]:
    schema = cast(dict[str, Any], json.loads(schema_path.read_text(encoding="utf-8")))
    packages: list[SeedAgentRecord] = []

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
            SeedAgentRecord(
                slug=config.id,
                name=config.name,
                description=config.description,
                version=config.version,
                schema_version=config.schema_version,
                instructions_markdown=markdown_path.read_text(encoding="utf-8"),
                public_instructions=config.public_instructions,
                model_provider=config.model.provider,
                model_name=config.model.name,
                model_temperature=config.model.temperature,
                model_max_tokens=config.model.max_tokens,
                runtime_timeout_seconds=config.runtime.timeout_seconds,
                runtime_internet_access=config.runtime.internet_access,
                runtime_execution_notes=config.runtime.execution_notes,
                input_mode=config.io.input_mode,
                output_mode=config.io.output_mode,
                package_path=str(directory),
                example_input_path=_optional_file(directory / "example-input.txt"),
                example_output_path=_optional_file(
                    directory / "example-response.json",
                    directory / "example-output.md",
                ),
                raw_config=raw_config,
                tools=[
                    SeedAgentTool(
                        name=tool.name,
                        description=tool.description,
                        image=build_tool_image(
                            agent_dir=directory,
                            agent_id=config.id,
                            agent_version=config.version,
                            tool_name=tool.name,
                            declared_image=tool.image,
                        ),
                        entrypoint=tool.entrypoint,
                        input_format=tool.input_format,
                        output_format=tool.output_format,
                        timeout_seconds=tool.timeout_seconds,
                    )
                    for tool in config.tools.items
                ],
            )
        )

    return packages


def _optional_file(*paths: Path) -> str | None:
    for path in paths:
        if path.exists():
            return str(path)
    return None


def build_tool_image(
    *,
    agent_dir: Path,
    agent_id: str,
    agent_version: str,
    tool_name: str,
    declared_image: str,
) -> str:
    build_dir = _resolve_tool_build_dir(agent_dir=agent_dir, tool_name=tool_name)
    if build_dir is None:
        return declared_image

    runtime_image = _runtime_tool_image_tag(
        agent_id=agent_id,
        agent_version=agent_version,
        tool_name=tool_name,
    )

    try:
        subprocess.run(
            ["docker", "build", "-t", runtime_image, str(build_dir)],
            check=True,
            capture_output=True,
            text=True,
        )
    except FileNotFoundError as exc:
        raise RegistryValidationError(
            "Docker is required to build packaged tool images during agent loading."
        ) from exc
    except subprocess.CalledProcessError as exc:
        output = (exc.stderr or exc.stdout or "").strip()
        raise RegistryValidationError(
            f"Failed to build tool image for '{agent_id}/{tool_name}': {output}"
        ) from exc

    return runtime_image


def _resolve_tool_build_dir(*, agent_dir: Path, tool_name: str) -> Path | None:
    candidates = [
        agent_dir / "tools" / tool_name,
        agent_dir / "tool",
    ]
    for candidate in candidates:
        if (candidate / "Dockerfile").exists():
            return candidate
    return None


def _runtime_tool_image_tag(
    *, agent_id: str, agent_version: str, tool_name: str
) -> str:
    normalized_agent_id = agent_id.replace("_", "-")
    normalized_tool_name = tool_name.replace("_", "-")
    return f"agenthub-local/{normalized_agent_id}-{normalized_tool_name}:{agent_version}"


if __name__ == "__main__":
    main()
