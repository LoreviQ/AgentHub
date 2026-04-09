from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, TypedDict

from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.db.models import AgentRecord
from backend.schemas.agent import AgentToolResponse
from backend.schemas.execution import AgentExecuteRequest
from backend.services.execution import AgentExecutionError, execute_agent


class MarketplaceFilters(BaseModel):
    category: str | None = None
    tools_enabled: bool | None = None
    output_mode: str | None = None
    model_provider: str | None = None
    executable_only: bool = True
    limit: int = Field(default=5, ge=1, le=10)


class InvocationOptions(BaseModel):
    include_run_metadata: bool = True


class MarketplaceMeta(TypedDict):
    short_pitch: str
    price: str
    trust_badge: str
    rating: float
    review_count: int
    categories: list[str]
    featured: bool
    use_cases: list[str]


def _read_optional_text(path_value: str | None) -> str | None:
    if not path_value:
        return None

    path = Path(path_value)
    if not path.exists() or not path.is_file():
        return None

    return path.read_text(encoding="utf-8")


def _read_optional_json(path_value: str | None) -> tuple[Any | None, str | None]:
    raw = _read_optional_text(path_value)
    if raw is None:
        return None, None

    try:
        return json.loads(raw), raw
    except json.JSONDecodeError:
        return None, raw


def _rating_summary(meta: MarketplaceMeta) -> str:
    return f"{meta['rating']:.1f} stars across {meta['review_count']} reviews"


def _fallback_marketplace_meta(record: AgentRecord) -> MarketplaceMeta:
    return {
        "short_pitch": record.marketplace_short_pitch,
        "price": record.marketplace_price,
        "trust_badge": record.marketplace_trust_badge,
        "rating": record.marketplace_rating,
        "review_count": record.marketplace_review_count,
        "categories": record.marketplace_categories,
        "featured": record.marketplace_featured,
        "use_cases": record.marketplace_use_cases,
    }


def _get_marketplace_meta(record: AgentRecord) -> MarketplaceMeta:
    return _fallback_marketplace_meta(record)


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip().lower()


def _tokenize(query: str) -> list[str]:
    return [token for token in re.split(r"[^a-z0-9]+", _normalize(query)) if token]


def _build_search_haystack(record: AgentRecord, meta: MarketplaceMeta) -> str:
    return " ".join(
        [
            record.slug,
            record.name,
            record.description,
            record.public_instructions,
            record.runtime_execution_notes or "",
            " ".join(meta["categories"]),
            " ".join(meta["use_cases"]),
            meta["short_pitch"],
        ]
    )


def _build_match_snippet(
    *, record: AgentRecord, meta: MarketplaceMeta, query_tokens: list[str]
) -> str:
    candidates = [
        record.name,
        record.description,
        meta["short_pitch"],
        *(meta["use_cases"]),
        record.runtime_execution_notes or "",
    ]

    if not query_tokens:
        return meta["short_pitch"]

    lowered_candidates = [candidate.lower() for candidate in candidates]
    for token in query_tokens:
        for idx, candidate in enumerate(lowered_candidates):
            if token in candidate:
                return candidates[idx]

    return meta["short_pitch"]


def _search_score(record: AgentRecord, meta: MarketplaceMeta, query_tokens: list[str]) -> int:
    if not query_tokens:
        return 1 + int(meta["featured"])

    haystack = _normalize(_build_search_haystack(record, meta))
    score = 0
    for token in query_tokens:
        if token in _normalize(record.name):
            score += 5
        if token in _normalize(record.description):
            score += 3
        if token in haystack:
            score += 1
    return score


def _matches_filters(
    record: AgentRecord,
    meta: MarketplaceMeta,
    filters: MarketplaceFilters,
) -> bool:
    if filters.tools_enabled is not None and bool(record.tools) != filters.tools_enabled:
        return False
    if filters.output_mode is not None and record.output_mode != filters.output_mode:
        return False
    if filters.model_provider is not None and record.model_provider != filters.model_provider:
        return False
    if filters.category is not None:
        category = filters.category.casefold()
        if all(entry.casefold() != category for entry in meta["categories"]):
            return False
    return True


def search_marketplace_records(
    *,
    session: Session,
    query: str,
    filters: MarketplaceFilters,
) -> list[dict[str, Any]]:
    query_tokens = _tokenize(query)
    records = session.query(AgentRecord).order_by(AgentRecord.name.asc()).all()
    ranked: list[tuple[int, AgentRecord, MarketplaceMeta]] = []

    for record in records:
        meta = _get_marketplace_meta(record)
        if not _matches_filters(record, meta, filters):
            continue

        score = _search_score(record, meta, query_tokens)
        if query_tokens and score <= 0:
            continue
        ranked.append((score, record, meta))

    ranked.sort(
        key=lambda item: (
            -item[0],
            -item[2]["rating"],
            item[1].name.casefold(),
        )
    )

    return [
        {
            "agent_id": record.slug,
            "name": record.name,
            "short_pitch": meta["short_pitch"],
            "price": meta["price"],
            "trust_badge": meta["trust_badge"],
            "rating_review_summary": _rating_summary(meta),
            "why_this_matched": _build_match_snippet(
                record=record, meta=meta, query_tokens=query_tokens
            ),
            "tools_enabled": bool(record.tools),
            "output_mode": record.output_mode,
        }
        for _, record, meta in ranked[: filters.limit]
    ]


def get_agent_marketplace_details(
    *,
    session: Session,
    agent_id: str,
) -> dict[str, Any] | None:
    record = (
        session.query(AgentRecord)
        .filter(AgentRecord.slug == agent_id)
        .one_or_none()
    )
    if record is None:
        return None

    meta = _get_marketplace_meta(record)
    example_output, example_output_raw = _read_optional_json(record.example_output_path)

    return {
        "agent_id": record.slug,
        "name": record.name,
        "description": record.description,
        "short_pitch": meta["short_pitch"],
        "price": meta["price"],
        "trust_badge": meta["trust_badge"],
        "rating_review_summary": _rating_summary(meta),
        "categories": meta["categories"],
        "version": record.version,
        "schema_version": record.schema_version,
        "model": {
            "provider": record.model_provider,
            "name": record.model_name,
            "temperature": record.model_temperature,
            "max_tokens": record.model_max_tokens,
        },
        "runtime": {
            "timeout_seconds": record.runtime_timeout_seconds,
            "internet_access": record.runtime_internet_access,
            "execution_notes": record.runtime_execution_notes,
        },
        "io_contract": {
            "input_mode": record.input_mode,
            "output_mode": record.output_mode,
            "request_schema": {
                "type": "object",
                "properties": {
                    "input": {
                        "type": "string",
                        "description": "User input to send to the agent runtime.",
                    }
                },
                "required": ["input"],
                "additionalProperties": False,
            },
        },
        "public_instructions": record.public_instructions,
        "instructions_markdown": record.instructions_markdown,
        "package_path": record.package_path,
        "example_input": _read_optional_text(record.example_input_path),
        "example_output": example_output,
        "example_output_raw": example_output_raw,
        "tools": [
            AgentToolResponse(
                name=tool.name,
                description=tool.description,
                image=tool.image,
                entrypoint=tool.entrypoint,
                input_format=tool.input_format,
                output_format=tool.output_format,
                timeout_seconds=tool.timeout_seconds,
            ).model_dump()
            for tool in record.tools
        ],
        "use_cases": meta["use_cases"],
        "raw_config": record.raw_config,
        "executable": True,
    }


async def invoke_marketplace_agent(
    *,
    session: Session,
    agent_id: str,
    user_input: str,
    options: InvocationOptions,
) -> dict[str, Any] | None:
    record = (
        session.query(AgentRecord)
        .filter(AgentRecord.slug == agent_id)
        .one_or_none()
    )
    if record is None:
        return None

    run = await execute_agent(
        session=session,
        record=record,
        request=AgentExecuteRequest(input=user_input),
    )
    if run.completed_at is None or run.output_payload is None:
        raise AgentExecutionError("Agent run completed without output")

    response: dict[str, Any] = {
        "run_id": run.id,
        "agent_id": record.slug,
        "status": run.status,
        "output": run.output_payload.get("output"),
    }
    if options.include_run_metadata:
        response["started_at"] = run.started_at.isoformat()
        response["completed_at"] = run.completed_at.isoformat()
        response["tool_calls"] = run.output_payload.get("tool_calls", [])

    return response
