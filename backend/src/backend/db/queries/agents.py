from __future__ import annotations

from sqlalchemy.orm import Session

from backend.db.models import AgentRecord


def list_agent_records(*, session: Session) -> list[AgentRecord]:
    return session.query(AgentRecord).order_by(AgentRecord.name.asc()).all()


def get_agent_record_by_slug(*, session: Session, agent_id: str) -> AgentRecord | None:
    return (
        session.query(AgentRecord)
        .filter(AgentRecord.slug == agent_id)
        .one_or_none()
    )
