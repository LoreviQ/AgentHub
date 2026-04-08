# AgentHub Backend

FastAPI backend for the AgentHub MVP.

## Local Postgres

```bash
cd /home/lore/workspace/AgentHub/backend
cp .env.example .env.local
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

The app reads values from the process environment only. Use `backend/.env.example` as the documented template, and let your execution context load `backend/.env.local` when needed, such as VS Code `envFile` or Docker Compose.
