from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session

from backend.db.models import AgentRecord
from backend.db.session import get_engine
from backend.schemas.agent import (
    AgentDetailResponse,
    AgentListItemResponse,
    AgentToolResponse,
)

router = APIRouter(tags=["agents"])


@router.get("/agents", response_model=list[AgentListItemResponse])
async def list_agents() -> list[AgentListItemResponse]:
    with Session(get_engine()) as session:
        records = session.query(AgentRecord).order_by(AgentRecord.name.asc()).all()
        return [
            AgentListItemResponse(
                id=record.slug,
                name=record.name,
                description=record.description,
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

        return AgentDetailResponse(
            id=record.slug,
            name=record.name,
            description=record.description,
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
