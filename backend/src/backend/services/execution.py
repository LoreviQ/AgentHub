from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any, Protocol

from sqlalchemy.orm import Session

from backend.db.models import AgentRecord, AgentRunRecord
from backend.schemas.execution import AgentExecuteRequest


class AgentExecutionError(RuntimeError):
    pass


@dataclass
class AgentExecutionResult:
    output: Any


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
    ) -> AgentExecutionResult:
        try:
            from pydantic_ai import Agent
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
) -> AgentRunRecord:
    if record.tools:
        raise AgentExecutionError(
            "Tool-enabled agents are not executable until tool dispatch is implemented."
        )

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

    try:
        provider = get_provider(provider_name=record.model_provider)
        result = await provider.generate(
            system_prompt=build_system_prompt(record),
            user_input=request.input,
            model_name=record.model_name,
            temperature=record.model_temperature,
            max_tokens=record.model_max_tokens,
            output_mode=record.output_mode,
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
    run.output_payload = {"output": result.output}
    run.completed_at = datetime.now(UTC)
    session.commit()
    session.refresh(run)
    return run
