from typing import Any

from pydantic import BaseModel


class AgentPaymentResponse(BaseModel):
    enabled: bool
    chain: str | None = None
    currency: str | None = None
    amount_atomic: int | None = None
    amount_display: str | None = None
    decimals: int | None = None
    recipient_address: str | None = None


class AgentToolResponse(BaseModel):
    name: str
    description: str
    image: str
    entrypoint: str
    input_format: str
    output_format: str
    timeout_seconds: int


class AgentListItemResponse(BaseModel):
    id: str
    name: str
    description: str
    marketplace_short_pitch: str
    marketplace_price: str
    payment: AgentPaymentResponse
    marketplace_trust_badge: str
    marketplace_rating: float
    marketplace_review_count: int
    marketplace_categories: list[str]
    marketplace_featured: bool
    version: str
    model_provider: str
    model_name: str
    input_mode: str
    output_mode: str
    tools_enabled: bool


class AgentDetailResponse(BaseModel):
    id: str
    name: str
    description: str
    marketplace_short_pitch: str
    marketplace_price: str
    payment: AgentPaymentResponse
    marketplace_trust_badge: str
    marketplace_rating: float
    marketplace_review_count: int
    marketplace_categories: list[str]
    marketplace_featured: bool
    marketplace_use_cases: list[str]
    version: str
    schema_version: int
    instructions_markdown: str
    public_instructions: str
    model_provider: str
    model_name: str
    model_temperature: float
    model_max_tokens: int
    runtime_timeout_seconds: int
    runtime_internet_access: bool
    runtime_execution_notes: str | None
    input_mode: str
    output_mode: str
    package_path: str
    example_input_path: str | None
    example_output_path: str | None
    example_input: str | None
    example_output: Any | None
    example_output_raw: str | None
    tools: list[AgentToolResponse]
