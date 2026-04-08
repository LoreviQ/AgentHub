from __future__ import annotations

import asyncio
import json
import shlex
from dataclasses import dataclass
from typing import Any, Protocol

from backend.db.models import AgentToolRecord


class ToolRuntimeError(RuntimeError):
    pass


class ToolExecutor(Protocol):
    async def execute(
        self,
        *,
        tool: AgentToolRecord,
        payload: dict[str, Any],
        internet_access: bool,
    ) -> Any: ...


@dataclass
class ToolInvocationRecord:
    tool_name: str
    image: str
    input_payload: dict[str, Any]
    output_payload: Any


class DockerToolExecutor:
    def __init__(self, *, docker_binary: str = "docker") -> None:
        self._docker_binary = docker_binary

    async def execute(
        self,
        *,
        tool: AgentToolRecord,
        payload: dict[str, Any],
        internet_access: bool,
    ) -> Any:
        command = [self._docker_binary, "run", "--rm", "-i"]
        if not internet_access:
            command.extend(["--network", "none"])

        entrypoint_args = shlex.split(tool.entrypoint)
        if entrypoint_args:
            command.extend(["--entrypoint", entrypoint_args[0]])

        command.append(tool.image)
        command.extend(entrypoint_args[1:])

        stdin = json.dumps(payload).encode("utf-8")

        try:
            process = await asyncio.create_subprocess_exec(
                *command,
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
        except OSError as exc:
            raise ToolRuntimeError(
                f"Failed to start tool container for '{tool.name}': {exc}"
            ) from exc

        try:
            stdout, stderr = await asyncio.wait_for(
                process.communicate(stdin),
                timeout=tool.timeout_seconds,
            )
        except TimeoutError as exc:
            process.kill()
            await process.communicate()
            raise ToolRuntimeError(
                f"Tool '{tool.name}' timed out after {tool.timeout_seconds} seconds."
            ) from exc

        stdout_text = stdout.decode("utf-8", errors="replace").strip()
        stderr_text = stderr.decode("utf-8", errors="replace").strip()

        if process.returncode != 0:
            raise ToolRuntimeError(
                f"Tool '{tool.name}' failed with exit code {process.returncode}: "
                f"{_summarize_process_output(stderr_text or stdout_text)}"
            )

        try:
            return json.loads(stdout_text or "null")
        except json.JSONDecodeError as exc:
            raise ToolRuntimeError(
                f"Tool '{tool.name}' returned invalid JSON: "
                f"{_summarize_process_output(stdout_text)}"
            ) from exc


def _summarize_process_output(value: str, *, limit: int = 240) -> str:
    normalized = " ".join(value.split())
    if len(normalized) <= limit:
        return normalized
    return f"{normalized[: limit - 3]}..."
