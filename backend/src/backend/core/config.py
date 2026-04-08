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
    database_url: str = Field()


@lru_cache
def get_settings() -> Settings:
    # BaseSettings resolves required values like `database_url` from the
    # process environment at runtime, but static checkers can't see that.
    return Settings()  # pyright: ignore[reportCallIssue]
