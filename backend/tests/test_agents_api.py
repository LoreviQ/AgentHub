import importlib.util
from pathlib import Path
from types import SimpleNamespace

import pytest
from alembic import command
from alembic.config import Config
from backend.core.config import get_settings
from backend.db.models import AgentRunRecord, AgentToolRecord
from backend.db.session import get_engine, reset_database_state
from backend.services.execution import AgentExecutionResult
from backend.services.registry import SeedAgentRecord, SeedAgentTool, sync_registry
from httpx import ASGITransport, AsyncClient
from sqlalchemy.orm import Session


def _run_migrations(tmp_path: Path, database_url: str) -> None:
    env_path = tmp_path / "test.env"
    env_path.write_text(f"AGENTHUB_DATABASE_URL={database_url}\n", encoding="utf-8")
    backend_root = Path(__file__).resolve().parents[1]
    alembic_config = Config(str(backend_root / "alembic.ini"))
    alembic_config.set_main_option("script_location", str(backend_root / "alembic"))
    alembic_config.set_main_option("prepend_sys_path", str(backend_root / "src"))
    alembic_config.cmd_opts = SimpleNamespace(x=[f"env={env_path}"])
    command.upgrade(alembic_config, "head")


def _seed_example_agents() -> list[SeedAgentRecord]:
    return [
        SeedAgentRecord(
            slug="clause-extractor",
            name="Clause Extractor Assistant",
            description="Extracts structured clauses from contract text with optional tool support.",
            version="0.1.0",
            schema_version=1,
            instructions_markdown="# Clause Extractor Assistant",
            public_instructions=(
                "When you need structured contract clause extraction, call:\n"
                "POST /api/agents/clause-extractor/execute"
            ),
            model_provider="openrouter",
            model_name="openai/gpt-5-mini",
            model_temperature=0.1,
            model_max_tokens=1800,
            runtime_timeout_seconds=60,
            runtime_internet_access=False,
            runtime_execution_notes=(
                "Tool-capable demo agent that may invoke approved short-lived container jobs."
            ),
            input_mode="text",
            output_mode="json",
            package_path="/examples/clause-extractor",
            example_input_path="/examples/clause-extractor/example-input.txt",
            example_output_path="/examples/clause-extractor/example-response.json",
            raw_config={"id": "clause-extractor"},
            tools=[
                SeedAgentTool(
                    name="clause_extractor",
                    description=(
                        "Extracts normalised clause spans and labels from contract text using deterministic text processing."
                    ),
                    image="agenthub/clause-tools:0.1.0",
                    entrypoint="python3 /app/main.py",
                    input_format="json",
                    output_format="json",
                    timeout_seconds=30,
                )
            ],
        ),
        SeedAgentRecord(
            slug="legal-checker",
            name="Legal Document Concern Checker",
            description="Reviews legal text and flags concerns that deserve follow-up.",
            version="0.1.0",
            schema_version=1,
            instructions_markdown="# Legal Document Concern Checker",
            public_instructions=(
                "When you need a quick legal-document risk review, call:\n"
                "POST /api/agents/legal-checker/execute"
            ),
            model_provider="openrouter",
            model_name="openai/gpt-5-mini",
            model_temperature=0.2,
            model_max_tokens=1800,
            runtime_timeout_seconds=60,
            runtime_internet_access=False,
            runtime_execution_notes=(
                "LLM-only demo agent executed through the shared AgentHub runtime."
            ),
            input_mode="text",
            output_mode="markdown",
            package_path="/examples/legal-checker",
            example_input_path="/examples/legal-checker/example-input.txt",
            example_output_path="/examples/legal-checker/example-response.json",
            raw_config={"id": "legal-checker"},
            tools=[],
        ),
    ]


@pytest.mark.anyio
async def test_list_and_get_agents(tmp_path: Path, monkeypatch) -> None:
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("AGENTHUB_DATABASE_URL", f"sqlite:///{db_path}")
    reset_database_state()
    get_settings.cache_clear()
    _run_migrations(tmp_path, get_settings().database_url)
    engine = get_engine()
    sync_registry(engine=engine, agents=_seed_example_agents())

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
        assert agent["example_input"] is None
        assert agent["example_output"] is None
        assert agent["example_output_raw"] is None

        tool_detail = await client.get("/api/agents/clause-extractor")
        assert tool_detail.status_code == 200
        tool_agent = tool_detail.json()
        assert len(tool_agent["tools"]) == 1
        assert tool_agent["tools"][0]["name"] == "clause_extractor"
        assert tool_agent["example_input"] is None
        assert tool_agent["example_output"] is None
        assert tool_agent["example_output_raw"] is None

        missing = await client.get("/api/agents/does-not-exist")
        assert missing.status_code == 404


def test_sync_registry_is_idempotent(tmp_path: Path, monkeypatch) -> None:
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("AGENTHUB_DATABASE_URL", f"sqlite:///{db_path}")
    reset_database_state()
    get_settings.cache_clear()
    _run_migrations(tmp_path, get_settings().database_url)
    engine = get_engine()

    agents = _seed_example_agents()
    sync_registry(engine=engine, agents=agents)
    sync_registry(engine=engine, agents=agents)


@pytest.mark.anyio
async def test_execute_llm_only_agent_records_run(tmp_path: Path, monkeypatch) -> None:
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("AGENTHUB_DATABASE_URL", f"sqlite:///{db_path}")
    reset_database_state()
    get_settings.cache_clear()
    _run_migrations(tmp_path, get_settings().database_url)
    engine = get_engine()
    sync_registry(engine=engine, agents=_seed_example_agents())

    from backend.main import create_app
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
            tools,
        ) -> AgentExecutionResult:
            assert "Legal Document Concern Checker" in system_prompt
            assert user_input == "This agreement renews automatically every year."
            assert model_name == "openai/gpt-5-mini"
            assert temperature == pytest.approx(0.2)
            assert max_tokens == 1800
            assert output_mode == "markdown"
            assert tools == []
            return AgentExecutionResult(output="## Summary\nAuto-renewal needs review.")

    monkeypatch.setattr(
        execution,
        "get_provider",
        lambda *, provider_name: FakeProvider(),
    )
    app = create_app()

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
            "output": "## Summary\nAuto-renewal needs review.",
            "tool_calls": [],
        }


def test_normalize_openrouter_model_name() -> None:
    from backend.services.execution import _normalize_openrouter_model_name

    assert _normalize_openrouter_model_name("gpt-5-mini") == "openai/gpt-5-mini"
    assert (
        _normalize_openrouter_model_name("anthropic/claude-sonnet-4")
        == "anthropic/claude-sonnet-4"
    )


def test_load_agent_packages_builds_local_tool_images(tmp_path: Path) -> None:
    repo_root = Path(__file__).resolve().parents[2]
    spec = importlib.util.spec_from_file_location(
        "load_local_agents",
        repo_root / "scripts" / "load_local_agents.py",
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    built_images: list[tuple[str, str, str]] = []

    def fake_build_tool_image(
        *,
        agent_dir: Path,
        agent_id: str,
        agent_version: str,
        tool_name: str,
        declared_image: str,
        tool_image_mode: str,
        tool_image_tag_prefix: str,
    ) -> str:
        assert tool_image_mode == "build-local"
        assert tool_image_tag_prefix == "agenthub-local"
        built_images.append((agent_id, agent_version, tool_name))
        return f"agenthub-local/{agent_id}-{tool_name}:{agent_version}"

    module.build_tool_image = fake_build_tool_image
    packages = module.load_agent_packages(
        repo_root / "agents",
        repo_root / "schemas" / "agent.schema.json",
        tool_image_mode="build-local",
        tool_image_tag_prefix="agenthub-local",
    )

    clause_extractor = next(package for package in packages if package.slug == "clause-extractor")
    assert built_images == [("clause-extractor", "0.1.0", "clause_extractor")]
    assert clause_extractor.tools[0].image == "agenthub-local/clause-extractor-clause_extractor:0.1.0"


@pytest.mark.anyio
async def test_execute_tool_enabled_agent_runs_registered_tool(
    tmp_path: Path, monkeypatch
) -> None:
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("AGENTHUB_DATABASE_URL", f"sqlite:///{db_path}")
    reset_database_state()
    get_settings.cache_clear()
    _run_migrations(tmp_path, get_settings().database_url)
    engine = get_engine()
    sync_registry(engine=engine, agents=_seed_example_agents())

    from backend.main import create_app
    from backend.services import execution

    class FakeToolExecutor:
        async def execute(
            self,
            *,
            tool: AgentToolRecord,
            payload: dict[str, object],
            internet_access: bool,
        ) -> object:
            assert tool.name == "clause_extractor"
            assert tool.image == "agenthub/clause-tools:0.1.0"
            assert payload == {
                "text": "Confidentiality and termination terms appear below."
            }
            assert internet_access is False
            return {
                "clauses": [
                    {"type": "confidentiality"},
                    {"type": "termination"},
                ],
                "tool_version": "0.1.0",
            }

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
            tools,
        ) -> AgentExecutionResult:
            assert "Clause Extractor Assistant" in system_prompt
            assert user_input == "Confidentiality and termination terms appear below."
            assert model_name == "openai/gpt-5-mini"
            assert temperature == pytest.approx(0.1)
            assert max_tokens == 1800
            assert output_mode == "json"
            assert len(tools) == 1
            tool_output = await tools[0].invoke({"text": user_input})
            return AgentExecutionResult(
                output={
                    "clauses": tool_output["clauses"],
                    "explanation": "Used the registered extraction tool.",
                }
            )

    fake_executor = FakeToolExecutor()
    monkeypatch.setattr(
        execution,
        "get_provider",
        lambda *, provider_name: FakeProvider(),
    )
    monkeypatch.setattr(execution, "DockerToolExecutor", lambda: fake_executor)

    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post(
            "/api/agents/clause-extractor/execute",
            json={"input": "Confidentiality and termination terms appear below."},
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["agent_id"] == "clause-extractor"
    assert payload["status"] == "completed"
    assert payload["output"] == {
        "clauses": [
            {"type": "confidentiality"},
            {"type": "termination"},
        ],
        "explanation": "Used the registered extraction tool.",
    }

    with Session(engine) as session:
        runs = session.query(AgentRunRecord).all()
        assert len(runs) == 1
        assert runs[0].status == "completed"
        assert runs[0].output_payload == {
            "output": {
                "clauses": [
                    {"type": "confidentiality"},
                    {"type": "termination"},
                ],
                "explanation": "Used the registered extraction tool.",
            },
            "tool_calls": [
                {
                    "tool_name": "clause_extractor",
                    "image": "agenthub/clause-tools:0.1.0",
                    "input": {
                        "text": "Confidentiality and termination terms appear below."
                    },
                    "output": {
                        "clauses": [
                            {"type": "confidentiality"},
                            {"type": "termination"},
                        ],
                        "tool_version": "0.1.0",
                    },
                }
            ],
        }
