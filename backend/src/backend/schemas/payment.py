from datetime import datetime

from pydantic import BaseModel, Field


class PaymentSessionCreateRequest(BaseModel):
    wallet_address: str = Field(min_length=1)
    budget_xtz: str = Field(min_length=1)
    expires_in_minutes: int = Field(default=30, ge=1, le=1440)
    label: str | None = None


class PaymentSessionResponse(BaseModel):
    session_id: int
    payment_token: str
    wallet_address: str
    label: str | None
    chain: str
    currency: str
    budget_atomic: int
    budget_display: str
    spent_atomic: int
    spent_display: str
    remaining_atomic: int
    remaining_display: str
    status: str
    expires_at: datetime | None
