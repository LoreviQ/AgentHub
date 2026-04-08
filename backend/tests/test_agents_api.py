from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from backend.core.config import get_settings
from backend.db.models import AgentRunRecord
from backend.db.session import get_engine, reset_database_state
from backend.services.execution import AgentExecutionResult
from backend.services.registry import sync_registry
from httpx import ASGITransport, AsyncClient
from sqlalchemy.orm import Session


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


def test_sync_registry_is_idempotent(tmp_path: Path, monkeypatch) -> None:
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("AGENTHUB_DATABASE_URL", f"sqlite:///{db_path}")
    reset_database_state()
    get_settings.cache_clear()
    settings = get_settings()

    _run_migrations()
    engine = get_engine()

    sync_registry(engine=engine, settings=settings)
    sync_registry(engine=engine, settings=settings)


@pytest.mark.anyio
async def test_execute_llm_only_agent_records_run(tmp_path: Path, monkeypatch) -> None:
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("AGENTHUB_DATABASE_URL", f"sqlite:///{db_path}")
    reset_database_state()
    get_settings.cache_clear()
    settings = get_settings()

    _run_migrations()
    engine = get_engine()
    sync_registry(engine=engine, settings=settings)

    from backend import main
    from backend.services import execution

    class FakeProvider:
        async def generate(
            self,
            *,
            system_prompt: str,
            user_input: str,
            model_name: str,
            temperature: float,
            max_tokens: int,
            output_mode: str,
        ) -> AgentExecutionResult:
            assert "Legal Document Concern Checker" in system_prompt
            assert user_input == "This agreement renews automatically every year."
            assert model_name == "gpt-5-mini"
            assert temperature == pytest.approx(0.2)
            assert max_tokens == 1800
            assert output_mode == "markdown"
            return AgentExecutionResult(output="## Summary\nAuto-renewal needs review.")

    monkeypatch.setattr(
        execution,
        "get_provider",
        lambda *, provider_name: FakeProvider(),
    )
    app = main.create_app()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post(
            "/api/agents/legal-checker/execute",
            json={"input": "This agreement renews automatically every year."},
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["agent_id"] == "legal-checker"
    assert payload["status"] == "completed"
    assert payload["output"] == "## Summary\nAuto-renewal needs review."

    with Session(engine) as session:
        runs = session.query(AgentRunRecord).all()
        assert len(runs) == 1
        assert runs[0].status == "completed"
        assert runs[0].input_payload == {
            "input": "This agreement renews automatically every year."
        }
        assert runs[0].output_payload == {
            "output": "## Summary\nAuto-renewal needs review."
        }


@pytest.mark.anyio
async def test_execute_tool_enabled_agent_returns_not_implemented(
    tmp_path: Path, monkeypatch
) -> None:
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
        response = await client.post(
            "/api/agents/clause-extractor/execute",
            json={"input": "Confidentiality and termination terms appear below."},
        )

    assert response.status_code == 501
    assert "Tool-enabled agents" in response.json()["detail"]
