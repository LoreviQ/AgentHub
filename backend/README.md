# AgentHub Backend

FastAPI backend for the AgentHub MVP.

## Local Postgres

```bash
cd /home/lore/workspace/AgentHub/backend
cp .env.example .env
docker compose up -d
```

## Run

```bash
cd /home/lore/workspace/AgentHub/backend
UV_CACHE_DIR=/tmp/uv-cache ~/.local/bin/uv run uvicorn backend.main:app --app-dir src --reload
```

## Migrations

```bash
cd /home/lore/workspace/AgentHub/backend
UV_CACHE_DIR=/tmp/uv-cache ~/.local/bin/uv run alembic upgrade head
```

The app defaults to PostgreSQL for local and deployed environments. Override `AGENTHUB_DATABASE_URL` only when you intentionally want a different database, such as SQLite in tests.
