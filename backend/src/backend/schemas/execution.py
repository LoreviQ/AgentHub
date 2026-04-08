from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class AgentExecuteRequest(BaseModel):
    input: str = Field(min_length=1)


class AgentExecuteResponse(BaseModel):
    run_id: int
    agent_id: str
    status: Literal["completed"]
    output: Any
    started_at: datetime
    completed_at: datetime
