from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parents[4]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="AGENTHUB_",
        extra="ignore",
    )

    app_name: str = "AgentHub Backend"
    api_prefix: str = "/api"
    database_url: str = Field()
    agents_dir: Path = ROOT_DIR / "agents"
    schema_path: Path = ROOT_DIR / "schemas" / "agent.schema.json"


@lru_cache
def get_settings() -> Settings:
    # BaseSettings resolves required values like `database_url` from the
    # process environment at runtime, but static checkers can't see that.
    return Settings()  # pyright: ignore[reportCallIssue]
