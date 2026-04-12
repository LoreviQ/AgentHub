from __future__ import annotations

from typing import Any

from fastmcp import FastMCP
from sqlalchemy.orm import Session

from backend.db.session import get_engine
from backend.services.execution import AgentExecutionError
from backend.services.marketplace import (
    InvocationOptions,
    MarketplaceFilters,
    get_agent_marketplace_details,
    invoke_marketplace_agent,
    search_marketplace_records,
)
from backend.services.payments import PaymentError, create_payment_session

MCP_INSTRUCTIONS = """
Browse AgentHub's live marketplace inventory and execute packaged specialist agents.
Use search_marketplace first to discover candidates, then call get_agent_details before
invoke_agent when you need the exact execution contract, tool policy, or example payload.
Use authorize_payment when you want AgentHub to pay on a user's behalf up to a capped
demo budget. Only pass structured args to invoke_agent.
""".strip()


def create_mcp_server() -> FastMCP:
    server = FastMCP(
        name="AgentHub Marketplace",
        instructions=MCP_INSTRUCTIONS,
        version="0.1.0",
    )

    @server.tool(
        description=(
            "Search the live AgentHub marketplace and return top executable agents "
            "with pricing, trust, review summary, and a short why-matched snippet."
        )
    )
    def search_marketplace(
        query: str,
        filters: MarketplaceFilters | None = None,
    ) -> dict[str, Any]:
        active_filters = filters or MarketplaceFilters()
        with Session(get_engine()) as session:
            results = search_marketplace_records(
                session=session,
                query=query,
                filters=active_filters,
            )

        return {
            "query": query,
            "filters_applied": active_filters.model_dump(),
            "results": results,
        }

    @server.tool(
        description=(
            "Create a capped demo payment authorization for an Etherlink wallet label. "
            "Returns a payment token that invoke_agent can spend against."
        )
    )
    def authorize_payment(
        wallet_address: str,
        budget_xtz: str,
        expires_in_minutes: int = 30,
        label: str | None = None,
    ) -> dict[str, Any]:
        with Session(get_engine()) as session:
            try:
                payment_session = create_payment_session(
                    session=session,
                    wallet_address=wallet_address,
                    budget_xtz=budget_xtz,
                    expires_in_minutes=expires_in_minutes,
                    label=label,
                )
            except PaymentError as exc:
                raise ValueError(str(exc)) from exc

        return {"payment_session": payment_session.model_dump()}

    @server.tool(
        description=(
            "Get the full contract for one marketplace agent, including execution "
            "schema, runtime details, public instructions, examples, tools, and price."
        )
    )
    def get_agent_details(agent_id: str) -> dict[str, Any]:
        with Session(get_engine()) as session:
            details = get_agent_marketplace_details(session=session, agent_id=agent_id)
        if details is None:
            raise ValueError(f"Unknown agent_id: {agent_id}")

        return {"agent": details}

    @server.tool(
        description=(
            "Invoke a live AgentHub agent with structured arguments only. "
            "Pass the chosen agent_id and the user input text."
        )
    )
    async def invoke_agent(
        agent_id: str,
        input: str,
        options: InvocationOptions | None = None,
    ) -> dict[str, Any]:
        active_options = options or InvocationOptions()
        with Session(get_engine()) as session:
            try:
                result = await invoke_marketplace_agent(
                    session=session,
                    agent_id=agent_id,
                    user_input=input,
                    options=active_options,
                )
            except AgentExecutionError as exc:
                raise ValueError(str(exc)) from exc

        if result is None:
            raise ValueError(f"Unknown agent_id: {agent_id}")

        return {
            "agent_id": agent_id,
            "options_applied": active_options.model_dump(),
            "run": result,
        }

    return server
