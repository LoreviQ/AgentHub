from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_DIR = Path(__file__).resolve().parents[4]
BACKEND_DIR = ROOT_DIR / "backend"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="AGENTHUB_",
        env_file=BACKEND_DIR / ".env",
        extra="ignore",
    )

    app_name: str = "AgentHub Backend"
    api_prefix: str = "/api"
    database_url: str = Field(
        default=f"sqlite:///{(BACKEND_DIR / 'agenthub.db').as_posix()}",
    )
    agents_dir: Path = ROOT_DIR / "agents"
    schema_path: Path = ROOT_DIR / "schemas" / "agent.schema.json"


@lru_cache
def get_settings() -> Settings:
    return Settings()
