from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class PaymentResultResponse(BaseModel):
    status: Literal["not_requested", "not_required", "authorized", "settled", "failed"]
    chain: str | None = None
    currency: str | None = None
    amount_atomic: int | None = None
    amount_display: str | None = None
    recipient_address: str | None = None
    transaction_hash: str | None = None
    payment_session_id: int | None = None
    error_message: str | None = None


class AgentExecuteRequest(BaseModel):
    input: str = Field(min_length=1)
    payment_token: str | None = None


class AgentExecuteResponse(BaseModel):
    run_id: int
    agent_id: str
    status: Literal["completed"]
    output: Any
    payment: PaymentResultResponse
    started_at: datetime
    completed_at: datetime
