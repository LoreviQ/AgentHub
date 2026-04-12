from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="AGENTHUB_",
        extra="ignore",
    )

    app_name: str = "AgentHub Backend"
    api_prefix: str = "/api"
    mcp_path: str = "/mcp"
    mcp_bearer_token: str | None = None
    database_url: str = Field()
    payments_enabled: bool = False
    payment_chain: str = "etherlink-shadownet"
    payment_rpc_url: str = "https://node.shadownet.etherlink.com"
    payment_contract_address: str | None = None
    payment_signer_private_key: str | None = None


@lru_cache
def get_settings() -> Settings:
    # BaseSettings resolves required values like `database_url` from the
    # process environment at runtime, but static checkers can't see that.
    return Settings()  # pyright: ignore[reportCallIssue]
