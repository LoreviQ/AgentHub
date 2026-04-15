Load local data scripts

# Upgrade to latest migration
```
docker run --rm \
  --network b13g7t0nuej26ehsmjpf2wjp \
  -e AGENTHUB_DATABASE_URL='postgresql+psycopg://agenthub:48rXJOGgcXgI5SbUNWB8@postgres:5432/agenthub' \
  ghcr.io/loreviq/agenthub-backend:latest \
  alembic upgrade head
```

# Load local data
```
docker run --rm \
  --network b13g7t0nuej26ehsmjpf2wjp \
  -e AGENTHUB_DATABASE_URL='postgresql+psycopg://agenthub:48rXJOGgcXgI5SbUNWB8@postgres:5432/agenthub' \
  -v ./agents:/app/agents:ro \
  -v ./schemas:/app/schemas:ro \
  ghcr.io/loreviq/agenthub-backend:latest \
  python /app/scripts/load_local_agents.py \
  --agents-dir /app/agents \
  --schema-path /app/schemas/agent.schema.json \
  --tool-image-mode declared
```