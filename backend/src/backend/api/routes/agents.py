import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session

from backend.db.models import AgentRecord
from backend.db.session import get_engine
from backend.schemas.agent import (
    AgentDetailResponse,
    AgentListItemResponse,
    AgentToolResponse,
)
from backend.schemas.execution import AgentExecuteRequest, AgentExecuteResponse
from backend.services.execution import AgentExecutionError, execute_agent

router = APIRouter(tags=["agents"])


def _read_optional_text(path_value: str | None) -> str | None:
    if not path_value:
        return None

    path = Path(path_value)
    if not path.exists() or not path.is_file():
        return None

    return path.read_text(encoding="utf-8")


def _read_optional_json(path_value: str | None) -> tuple[Any | None, str | None]:
    raw = _read_optional_text(path_value)
    if raw is None:
        return None, None

    try:
        return json.loads(raw), raw
    except json.JSONDecodeError:
        return None, raw


@router.get("/agents", response_model=list[AgentListItemResponse])
async def list_agents() -> list[AgentListItemResponse]:
    with Session(get_engine()) as session:
        records = session.query(AgentRecord).order_by(AgentRecord.name.asc()).all()
        return [
            AgentListItemResponse(
                id=record.slug,
                name=record.name,
                description=record.description,
                marketplace_short_pitch=record.marketplace_short_pitch,
                marketplace_price=record.marketplace_price,
                marketplace_trust_badge=record.marketplace_trust_badge,
                marketplace_rating=record.marketplace_rating,
                marketplace_review_count=record.marketplace_review_count,
                marketplace_categories=record.marketplace_categories,
                marketplace_featured=record.marketplace_featured,
                version=record.version,
                model_provider=record.model_provider,
                model_name=record.model_name,
                input_mode=record.input_mode,
                output_mode=record.output_mode,
                tools_enabled=bool(record.tools),
            )
            for record in records
        ]


@router.get("/agents/{agent_id}", response_model=AgentDetailResponse)
async def get_agent(agent_id: str) -> AgentDetailResponse:
    with Session(get_engine()) as session:
        record = (
            session.query(AgentRecord)
            .filter(AgentRecord.slug == agent_id)
            .one_or_none()
        )
        if record is None:
            raise HTTPException(status_code=404, detail="Agent not found")

        example_output, example_output_raw = _read_optional_json(
            record.example_output_path
        )

        return AgentDetailResponse(
            id=record.slug,
            name=record.name,
            description=record.description,
            marketplace_short_pitch=record.marketplace_short_pitch,
            marketplace_price=record.marketplace_price,
            marketplace_trust_badge=record.marketplace_trust_badge,
            marketplace_rating=record.marketplace_rating,
            marketplace_review_count=record.marketplace_review_count,
            marketplace_categories=record.marketplace_categories,
            marketplace_featured=record.marketplace_featured,
            marketplace_use_cases=record.marketplace_use_cases,
            version=record.version,
            schema_version=record.schema_version,
            instructions_markdown=record.instructions_markdown,
            public_instructions=record.public_instructions,
            model_provider=record.model_provider,
            model_name=record.model_name,
            model_temperature=record.model_temperature,
            model_max_tokens=record.model_max_tokens,
            runtime_timeout_seconds=record.runtime_timeout_seconds,
            runtime_internet_access=record.runtime_internet_access,
            runtime_execution_notes=record.runtime_execution_notes,
            input_mode=record.input_mode,
            output_mode=record.output_mode,
            package_path=record.package_path,
            example_input_path=record.example_input_path,
            example_output_path=record.example_output_path,
            example_input=_read_optional_text(record.example_input_path),
            example_output=example_output,
            example_output_raw=example_output_raw,
            tools=[
                AgentToolResponse(
                    name=tool.name,
                    description=tool.description,
                    image=tool.image,
                    entrypoint=tool.entrypoint,
                    input_format=tool.input_format,
                    output_format=tool.output_format,
                    timeout_seconds=tool.timeout_seconds,
                )
                for tool in record.tools
            ],
        )


@router.post("/agents/{agent_id}/execute", response_model=AgentExecuteResponse)
async def execute_agent_route(
    agent_id: str, request: AgentExecuteRequest
) -> AgentExecuteResponse:
    with Session(get_engine()) as session:
        record = (
            session.query(AgentRecord)
            .filter(AgentRecord.slug == agent_id)
            .one_or_none()
        )
        if record is None:
            raise HTTPException(status_code=404, detail="Agent not found")

        try:
            run = await execute_agent(session=session, record=record, request=request)
        except AgentExecutionError as exc:
            message = str(exc)
            status_code = 501 if "Tool-enabled agents" in message else 502
            raise HTTPException(status_code=status_code, detail=message) from exc

        if run.completed_at is None or run.output_payload is None:
            raise HTTPException(
                status_code=500, detail="Agent run completed without output"
            )

        return AgentExecuteResponse(
            run_id=run.id,
            agent_id=record.slug,
            status="completed",
            output=run.output_payload["output"],
            started_at=run.started_at,
            completed_at=run.completed_at,
        )
