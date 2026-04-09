from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from backend.api.routes.agents import router as agents_router
from backend.core.config import get_settings
from backend.services.mcp_server import create_mcp_server


def create_app() -> FastAPI:
    settings = get_settings()
    mcp_http_app = create_mcp_server().http_app(
        path="/",
        transport="streamable-http",
        stateless_http=True,
    )

    app = FastAPI(title=settings.app_name, lifespan=mcp_http_app.lifespan)
    app.include_router(agents_router, prefix=settings.api_prefix)
    mcp_mount_path = settings.mcp_path.rstrip("/") or "/"
    app.mount(
        mcp_mount_path,
        mcp_http_app,
        name="agenthub-mcp",
    )

    @app.middleware("http")
    async def require_mcp_bearer_token(request: Request, call_next):
        token = settings.mcp_bearer_token
        if token:
            path = request.url.path
            if path == mcp_mount_path or path.startswith(f"{mcp_mount_path}/"):
                auth_header = request.headers.get("authorization")
                if auth_header != f"Bearer {token}":
                    return JSONResponse(
                        {"detail": "Unauthorized MCP request"},
                        status_code=401,
                    )
        return await call_next(request)

    @app.get("/health", tags=["health"])
    def healthcheck() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
