from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from backend.core.config import get_settings
from backend.db.session import get_engine, reset_database_state
from backend.services.registry import sync_registry
from httpx import ASGITransport, AsyncClient


def _run_migrations() -> None:
    alembic_config = Config(str(Path(__file__).resolve().parents[1] / "alembic.ini"))
    command.upgrade(alembic_config, "head")


@pytest.mark.anyio
async def test_list_and_get_agents(tmp_path: Path, monkeypatch) -> None:
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("AGENTHUB_DATABASE_URL", f"sqlite:///{db_path}")
    reset_database_state()
    get_settings.cache_clear()
    settings = get_settings()

    _run_migrations()
    engine = get_engine()
    sync_registry(engine=engine, settings=settings)

    from backend.main import create_app

    app = create_app()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.get("/api/agents")
        assert response.status_code == 200
        payload = response.json()
        assert len(payload) == 2
        assert [item["id"] for item in payload] == ["clause-extractor", "legal-checker"]

        detail = await client.get("/api/agents/legal-checker")
        assert detail.status_code == 200
        agent = detail.json()
        assert agent["id"] == "legal-checker"
        assert agent["model_provider"] == "openrouter"
        assert agent["tools"] == []

        tool_detail = await client.get("/api/agents/clause-extractor")
        assert tool_detail.status_code == 200
        tool_agent = tool_detail.json()
        assert len(tool_agent["tools"]) == 1
        assert tool_agent["tools"][0]["name"] == "clause_extractor"

        missing = await client.get("/api/agents/does-not-exist")
        assert missing.status_code == 404
