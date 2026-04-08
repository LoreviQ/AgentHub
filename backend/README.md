# AgentHub Backend

FastAPI backend for the AgentHub MVP.

## Local Postgres

```bash
cd /home/lore/workspace/AgentHub
cp backend/.env.example backend/.env.local
docker compose up --build -d postgres migrate
```

This starts:

- `postgres`
- `migrate` as a one-shot Alembic job

The migration service uses the multi-stage image built from [backend/Dockerfile](/home/lore/workspace/AgentHub/backend/Dockerfile). The image bakes in:

- the installed backend package
- Alembic config and migration files
- the packaged agents
- the JSON schema files

Run the API itself through the VS Code launch profile in [.vscode/launch.json](/home/lore/workspace/AgentHub/.vscode/launch.json).

## Run

```bash
cd /home/lore/workspace/AgentHub/backend
AGENTHUB_DATABASE_URL=postgresql+psycopg://agenthub:agenthub@localhost:5432/agenthub \
UV_CACHE_DIR=/tmp/uv-cache ~/.local/bin/uv run alembic upgrade head

AGENTHUB_DATABASE_URL=postgresql+psycopg://agenthub:agenthub@localhost:5432/agenthub \
UV_CACHE_DIR=/tmp/uv-cache ~/.local/bin/uv run uvicorn backend.main:app --app-dir src --reload
```

## Migrations

```bash
cd /home/lore/workspace/AgentHub/backend
UV_CACHE_DIR=/tmp/uv-cache ~/.local/bin/uv run alembic upgrade head
```

The app reads values from the process environment only. Use `backend/.env.example` as the documented template, and let your execution context load `backend/.env.local` when needed, such as VS Code `envFile` or Docker Compose.

The backend no longer creates tables on startup. Run `alembic upgrade head` before starting the API so schema changes always flow through migrations.

When the schema changes:

1. Update the SQLAlchemy models.
2. Create a new Alembic revision.
3. Commit that migration file.
4. Restart the local stack or rerun the migration job so `alembic upgrade head` applies it.
