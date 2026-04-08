from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any, Awaitable, Callable, Protocol

from sqlalchemy.orm import Session

from backend.db.models import AgentRecord, AgentRunRecord, AgentToolRecord
from backend.schemas.execution import AgentExecuteRequest
from backend.services.tool_runtime import (
    DockerToolExecutor,
    ToolExecutor,
    ToolInvocationRecord,
    ToolRuntimeError,
)


class AgentExecutionError(RuntimeError):
    pass


@dataclass
class AgentExecutionResult:
    output: Any


@dataclass
class RuntimeTool:
    record: AgentToolRecord
    invoke: ToolInvoker


ToolInvoker = Callable[[dict[str, Any]], Awaitable[Any]]


class LLMProvider(Protocol):
    async def generate(
        self,
        *,
        system_prompt: str,
        user_input: str,
        model_name: str,
        temperature: float,
        max_tokens: int,
        output_mode: str,
        tools: list[RuntimeTool],
    ) -> AgentExecutionResult: ...


class OpenRouterProvider:
    async def generate(
        self,
        *,
        system_prompt: str,
        user_input: str,
        model_name: str,
        temperature: float,
        max_tokens: int,
        output_mode: str,
        tools: list[RuntimeTool],
    ) -> AgentExecutionResult:
        try:
            from pydantic_ai import Agent, Tool
            from pydantic_ai.models.openai import OpenAIChatModel
            from pydantic_ai.providers.openrouter import OpenRouterProvider
        except ImportError as exc:
            raise AgentExecutionError(
                "OpenRouter execution requires the optional 'pydantic-ai' dependency."
            ) from exc

        output_instructions = (
            "Return valid JSON only."
            if output_mode == "json"
            else "Return markdown only."
        )
        resolved_model_name = _normalize_openrouter_model_name(model_name)
        runtime_tools = [
            Tool(
                _build_pydantic_tool_function(tool),
                name=tool.record.name,
                description=(
                    f"{tool.record.description} "
                    "Provide the source document text via the `text` field."
                ),
            )
            for tool in tools
        ]
        agent = Agent(
            model=OpenAIChatModel(
                resolved_model_name,
                provider=OpenRouterProvider(),
            ),
            system_prompt=f"{system_prompt}\n\n{output_instructions}",
            model_settings={
                "temperature": temperature,
                "max_tokens": max_tokens,
            },
            tools=runtime_tools,
        )
        result = await agent.run(user_input)
        return AgentExecutionResult(output=result.output)


def get_provider(*, provider_name: str) -> LLMProvider:
    if provider_name == "openrouter":
        return OpenRouterProvider()
    raise AgentExecutionError(f"Unsupported model provider '{provider_name}'.")


def _normalize_openrouter_model_name(model_name: str) -> str:
    if "/" in model_name:
        return model_name
    return f"openai/{model_name}"


def build_system_prompt(record: AgentRecord) -> str:
    return "\n\n".join(
        [
            f"# AgentHub Runtime\n\nAgent ID: {record.slug}\nAgent Name: {record.name}",
            record.instructions_markdown.strip(),
        ]
    )


async def execute_agent(
    *,
    session: Session,
    record: AgentRecord,
    request: AgentExecuteRequest,
    tool_executor: ToolExecutor | None = None,
) -> AgentRunRecord:
    started_at = datetime.now(UTC)
    run = AgentRunRecord(
        agent_id=record.id,
        status="running",
        provider=record.model_provider,
        model_name=record.model_name,
        input_payload={"input": request.input},
        started_at=started_at,
    )
    session.add(run)
    session.flush()

    invocations: list[ToolInvocationRecord] = []
    try:
        provider = get_provider(provider_name=record.model_provider)
        result = await provider.generate(
            system_prompt=build_system_prompt(record),
            user_input=request.input,
            model_name=record.model_name,
            temperature=record.model_temperature,
            max_tokens=record.model_max_tokens,
            output_mode=record.output_mode,
            tools=_build_runtime_tools(
                tools=record.tools,
                executor=tool_executor or DockerToolExecutor(),
                internet_access=record.runtime_internet_access,
                invocations=invocations,
            ),
        )
    except Exception as exc:
        run.status = "failed"
        run.error_message = str(exc)
        run.completed_at = datetime.now(UTC)
        session.commit()
        if isinstance(exc, AgentExecutionError):
            raise
        raise AgentExecutionError("Agent execution failed.") from exc

    run.status = "completed"
    run.output_payload = {
        "output": _normalize_output(result.output, output_mode=record.output_mode),
        "tool_calls": [
            {
                "tool_name": invocation.tool_name,
                "image": invocation.image,
                "input": invocation.input_payload,
                "output": invocation.output_payload,
            }
            for invocation in invocations
        ],
    }
    run.completed_at = datetime.now(UTC)
    session.commit()
    session.refresh(run)
    return run


def _build_runtime_tools(
    *,
    tools: list[AgentToolRecord],
    executor: ToolExecutor,
    internet_access: bool,
    invocations: list[ToolInvocationRecord],
) -> list[RuntimeTool]:
    runtime_tools: list[RuntimeTool] = []
    for tool in tools:

        async def invoke(
            payload: dict[str, Any], *, tool_record: AgentToolRecord = tool
        ) -> Any:
            try:
                output = await executor.execute(
                    tool=tool_record,
                    payload=payload,
                    internet_access=internet_access,
                )
            except ToolRuntimeError as exc:
                raise AgentExecutionError(str(exc)) from exc

            invocations.append(
                ToolInvocationRecord(
                    tool_name=tool_record.name,
                    image=tool_record.image,
                    input_payload=payload,
                    output_payload=output,
                )
            )
            return output

        runtime_tools.append(RuntimeTool(record=tool, invoke=invoke))

    return runtime_tools


def _build_pydantic_tool_function(
    tool: RuntimeTool,
) -> Callable[[str], Awaitable[Any]]:
    async def _invoke_tool(text: str) -> Any:
        return await tool.invoke({"text": text})

    _invoke_tool.__name__ = tool.record.name
    return _invoke_tool


def _normalize_output(output: Any, *, output_mode: str) -> Any:
    if output_mode != "json" or not isinstance(output, str):
        return output

    try:
        return json.loads(output)
    except json.JSONDecodeError:
        return output
