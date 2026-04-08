from typing import Literal

from pydantic import BaseModel, ConfigDict


class ModelConfig(BaseModel):
    provider: str
    name: str
    temperature: float
    max_tokens: int


class RuntimeConfig(BaseModel):
    timeout_seconds: int
    internet_access: bool
    execution_notes: str | None = None


class IOConfig(BaseModel):
    input_mode: Literal["text"]
    output_mode: Literal["markdown", "json"]


class ToolConfig(BaseModel):
    name: str
    description: str
    image: str
    entrypoint: str
    input_format: Literal["json"]
    output_format: Literal["json"]
    timeout_seconds: int


class ToolsConfig(BaseModel):
    enabled: bool
    items: list[ToolConfig]


class AgentPackageConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")

    schema_version: Literal[1]
    id: str
    name: str
    description: str
    version: str
    model: ModelConfig
    runtime: RuntimeConfig
    io: IOConfig
    tools: ToolsConfig
    public_instructions: str
