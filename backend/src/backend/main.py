from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from backend.api.routes.agents import router as agents_router
from backend.core.config import get_settings
from backend.db.base import Base
from backend.db.session import get_engine
from backend.services.registry import sync_registry


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    engine = get_engine()
    Base.metadata.create_all(bind=engine)
    sync_registry(engine=engine, settings=settings)
    yield


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(title=settings.app_name, lifespan=lifespan)
    app.include_router(agents_router, prefix=settings.api_prefix)

    @app.get("/health", tags=["health"])
    def healthcheck() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
