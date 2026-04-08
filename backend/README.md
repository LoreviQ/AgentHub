# AgentHub Backend

FastAPI backend for the AgentHub MVP.

## Run

```bash
cd /home/lore/workspace/AgentHub/backend
UV_CACHE_DIR=/tmp/uv-cache ~/.local/bin/uv run uvicorn backend.main:app --reload
```

## Migrations

```bash
cd /home/lore/workspace/AgentHub/backend
UV_CACHE_DIR=/tmp/uv-cache ~/.local/bin/uv run alembic upgrade head
```

Set `AGENTHUB_DATABASE_URL` to point at PostgreSQL in deployed environments.
