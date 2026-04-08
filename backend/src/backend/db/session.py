from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from backend.core.config import get_settings


_engine: Engine | None = None
_session_factory: sessionmaker[Session] | None = None


def _engine_kwargs(database_url: str) -> dict[str, object]:
    if database_url.startswith("sqlite"):
        return {"connect_args": {"check_same_thread": False}}
    return {}


def get_engine() -> Engine:
    global _engine, _session_factory
    if _engine is None:
        settings = get_settings()
        _engine = create_engine(settings.database_url, **_engine_kwargs(settings.database_url))
        _session_factory = sessionmaker(bind=_engine, autocommit=False, autoflush=False)
    return _engine


def reset_database_state() -> None:
    global _engine, _session_factory
    if _engine is not None:
        _engine.dispose()
    _engine = None
    _session_factory = None


def get_session() -> Generator[Session, None, None]:
    global _session_factory
    if _session_factory is None:
        get_engine()
    assert _session_factory is not None
    session = _session_factory()
    try:
        yield session
    finally:
        session.close()
