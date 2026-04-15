from pathlib import Path
from types import SimpleNamespace
import inspect

import pytest
from alembic import command
from alembic.config import Config
from backend.core.config import get_settings
from backend.db.session import get_engine, reset_database_state
from backend.services.execution import AgentExecutionResult
from backend.services.payments import xtz_to_atomic
from backend.services.registry import SeedAgentRecord, SeedAgentTool, sync_registry
from httpx import ASGITransport, AsyncClient


def _get_registered_tool(server, name: str):
    for component in server._local_provider._components.values():
        if getattr(component, "name", None) == name:
            return component
    raise AssertionError(f"Tool not found: {name}")


async def _invoke_tool(server, name: str, **kwargs):
    tool = _get_registered_tool(server, name)
    result = tool.fn(**kwargs)
    if inspect.isawaitable(result):
        result = await result
    return result


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
            marketplace_short_pitch="Structured clause extraction with optional packaged tool support.",
            marketplace_price="0.14 XTZ / run",
            payment_enabled=True,
            payment_chain="etherlink-shadownet",
            payment_currency="XTZ",
            payment_amount_atomic=xtz_to_atomic("0.14"),
            payment_decimals=18,
            payment_recipient_address="0x2222222222222222222222222222222222222222",
            marketplace_trust_badge="Platform verified",
            marketplace_rating=4.8,
            marketplace_review_count=18,
            marketplace_categories=["Legal", "Extraction", "Structured Data"],
            marketplace_featured=True,
            marketplace_use_cases=[
                "Transform contracts into structured clause records",
                "Feed downstream compliance or review workflows",
                "Show selective tool use inside a curated runtime",
            ],
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
            marketplace_short_pitch="Fast contract-risk triage for founders, ops leads, and legal teams.",
            marketplace_price="0.08 XTZ / run",
            payment_enabled=True,
            payment_chain="etherlink-shadownet",
            payment_currency="XTZ",
            payment_amount_atomic=xtz_to_atomic("0.08"),
            payment_decimals=18,
            payment_recipient_address="0x1111111111111111111111111111111111111111",
            marketplace_trust_badge="Platform verified",
            marketplace_rating=4.9,
            marketplace_review_count=26,
            marketplace_categories=["Legal", "Risk", "Founders"],
            marketplace_featured=True,
            marketplace_use_cases=[
                "Review vendor agreements before redline",
                "Spot renewal, liability, and subprocessor risks",
                "Give another assistant a safe escalation target",
            ],
            package_path="/examples/legal-checker",
            example_input_path="/examples/legal-checker/example-input.txt",
            example_output_path="/examples/legal-checker/example-response.json",
            raw_config={"id": "legal-checker"},
            tools=[],
        ),
    ]


@pytest.mark.anyio
async def test_search_marketplace_tool_returns_ranked_results(
    tmp_path: Path, monkeypatch
) -> None:
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("AGENTHUB_DATABASE_URL", f"sqlite:///{db_path}")
    reset_database_state()
    get_settings.cache_clear()
    _run_migrations(tmp_path, get_settings().database_url)
    sync_registry(engine=get_engine(), agents=_seed_example_agents())

    from backend.services.mcp_server import create_mcp_server
    from backend.services.marketplace import MarketplaceFilters

    server = create_mcp_server()
    payload = await _invoke_tool(
        server,
        "search_marketplace",
        query="structured clause extraction",
        filters=MarketplaceFilters(tools_enabled=True),
    )
    assert payload["results"][0]["agent_id"] == "clause-extractor"
    assert payload["results"][0]["price"] == "0.14 XTZ / run"
    assert payload["results"][0]["payment"]["currency"] == "XTZ"
    assert payload["results"][0]["trust_badge"] == "Platform verified"
    assert "structured" in payload["results"][0]["why_this_matched"].lower()


@pytest.mark.anyio
async def test_get_agent_details_tool_returns_contract(tmp_path: Path, monkeypatch) -> None:
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("AGENTHUB_DATABASE_URL", f"sqlite:///{db_path}")
    reset_database_state()
    get_settings.cache_clear()
    _run_migrations(tmp_path, get_settings().database_url)
    sync_registry(engine=get_engine(), agents=_seed_example_agents())

    from backend.services.mcp_server import create_mcp_server

    server = create_mcp_server()
    payload = await _invoke_tool(server, "get_agent_details", agent_id="legal-checker")
    agent = payload["agent"]
    assert agent["agent_id"] == "legal-checker"
    assert agent["price"] == "0.08 XTZ / run"
    assert agent["payment"]["amount_display"] == "0.08 XTZ"
    assert agent["io_contract"]["request_schema"]["required"] == ["input"]
    assert agent["model"]["name"] == "openai/gpt-5-mini"
    assert agent["executable"] is True


@pytest.mark.anyio
async def test_invoke_agent_tool_executes_agent(tmp_path: Path, monkeypatch) -> None:
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("AGENTHUB_DATABASE_URL", f"sqlite:///{db_path}")
    reset_database_state()
    get_settings.cache_clear()
    _run_migrations(tmp_path, get_settings().database_url)
    sync_registry(engine=get_engine(), agents=_seed_example_agents())

    from backend.services.mcp_server import create_mcp_server
    from backend.services.marketplace import InvocationOptions
    from backend.services import execution, payments

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
            assert user_input == "Flag the risky renewal language."
            assert model_name == "openai/gpt-5-mini"
            assert temperature == pytest.approx(0.2)
            assert max_tokens == 1800
            assert output_mode == "markdown"
            assert tools == []
            return AgentExecutionResult(output="## Concerns\nAuto-renewal looks one-sided.")

    monkeypatch.setattr(
        execution,
        "get_provider",
        lambda *, provider_name: FakeProvider(),
    )
    monkeypatch.setattr(
        payments,
        "submit_etherlink_settlement",
        lambda *, run, recipient_address, amount_atomic: payments.OnchainSettlementResult(
            transaction_hash="0xabc123"
        ),
    )
    server = create_mcp_server()
    payment_session = await _invoke_tool(
        server,
        "authorize_payment",
        wallet_address="0xfeed00000000000000000000000000000000beef",
        budget_xtz="0.50",
        label="Demo buyer",
    )
    payload = await _invoke_tool(
        server,
        "invoke_agent",
        agent_id="legal-checker",
        input="Flag the risky renewal language.",
        options=InvocationOptions(
            include_run_metadata=False,
            payment_token=payment_session["payment_session"]["payment_token"],
        ),
    )
    assert payload["agent_id"] == "legal-checker"
    assert payload["run"]["status"] == "completed"
    assert payload["run"]["output"] == "## Concerns\nAuto-renewal looks one-sided."
    assert payload["run"]["payment"]["status"] == "settled"
    assert "started_at" not in payload["run"]


@pytest.mark.anyio
async def test_mcp_http_endpoint_is_mounted_under_backend_app(
    tmp_path: Path, monkeypatch
) -> None:
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("AGENTHUB_DATABASE_URL", f"sqlite:///{db_path}")
    reset_database_state()
    get_settings.cache_clear()
    _run_migrations(tmp_path, get_settings().database_url)
    sync_registry(engine=get_engine(), agents=_seed_example_agents())

    from backend.main import create_app

    app = create_app()
    async with app.router.lifespan_context(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(
            transport=transport, base_url="http://testserver"
        ) as client:
            response = await client.post(
                "/mcp/",
                headers={"accept": "application/json, text/event-stream"},
                json={},
    )

    assert response.status_code == 400
    assert "Validation error" in response.json()["error"]["message"]


@pytest.mark.anyio
async def test_mcp_http_endpoint_enforces_optional_bearer_token(
    tmp_path: Path, monkeypatch
) -> None:
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("AGENTHUB_DATABASE_URL", f"sqlite:///{db_path}")
    monkeypatch.setenv("AGENTHUB_MCP_BEARER_TOKEN", "secret-token")
    reset_database_state()
    get_settings.cache_clear()
    _run_migrations(tmp_path, get_settings().database_url)
    sync_registry(engine=get_engine(), agents=_seed_example_agents())

    from backend.main import create_app

    app = create_app()
    async with app.router.lifespan_context(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(
            transport=transport, base_url="http://testserver"
        ) as client:
            missing = await client.get("/mcp/")
            wrong = await client.get(
                "/mcp/",
                headers={"authorization": "Bearer wrong-token"},
            )
            allowed = await client.get(
                "/mcp/",
                headers={"authorization": "Bearer secret-token"},
            )

    assert missing.status_code == 401
    assert wrong.status_code == 401
    assert allowed.status_code == 405
