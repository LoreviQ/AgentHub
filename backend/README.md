# AgentHub Backend

FastAPI backend for the AgentHub MVP.

## Local Postgres

```bash
cd /home/lore/workspace/AgentHub
cp backend/.env.example backend/.env.local
cp backend/.env.example backend/.env.prod
docker compose up --build -d postgres alembic-migrate load-sync backend-api
```

This starts:

- `postgres`
- `alembic-migrate` as a one-shot Alembic job
- `load-sync` as a one-shot loader for the example local agents
- `backend-api` as the standalone API container

The Docker stack uses:

- `backend/.env.local` for VS Code and direct local commands
- `backend/.env.prod` for Docker Compose and future Coolify-style container runs

The shared platform image is built from [docker/backend/Dockerfile](/home/lore/workspace/AgentHub/docker/backend/Dockerfile). The image bakes in:

- the installed backend package
- Alembic config and migration files
- the standalone loader scripts
- Docker CLI so the API and loader can interact with the host Docker engine

The API and loader mount `/var/run/docker.sock` because:

- `load-sync` builds local packaged tool images for the demo agents
- `backend-api` executes approved tool containers with `docker run`

Run the API itself through the VS Code launch profile in [.vscode/launch.json](/home/lore/workspace/AgentHub/.vscode/launch.json).

## Run

```bash
cd /home/lore/workspace/AgentHub/backend
AGENTHUB_DATABASE_URL=postgresql+psycopg://agenthub:agenthub@localhost:5432/agenthub \
UV_CACHE_DIR=/tmp/uv-cache ~/.local/bin/uv run alembic -x env=.env.local upgrade head

OPENROUTER_API_KEY=sk-or-v1-... \
AGENTHUB_DATABASE_URL=postgresql+psycopg://agenthub:agenthub@localhost:5432/agenthub \
UV_CACHE_DIR=/tmp/uv-cache ~/.local/bin/uv run uvicorn backend.main:app --app-dir src --reload
```

## MCP Server

The backend now serves two APIs from the same process:

- REST API at `/api`
- MCP server at `/mcp/`

The MCP server is mounted as a streamable HTTP endpoint and starts automatically
with the main backend app. Use the normal backend startup command, then connect
an MCP client to `https://<your-host>/mcp/`.

If you set `AGENTHUB_MCP_BEARER_TOKEN`, clients must send:

```text
Authorization: Bearer <token>
```

The MCP server exposes:

- `search_marketplace`
- `get_agent_details`
- `authorize_payment`
- `invoke_agent`

## Demo Payments

The backend now includes a hackathon-grade Etherlink shadownet payment flow:

- Agents can expose structured XTZ pricing and a payout wallet.
- Clients can create a capped delegated payment session at `POST /api/payments/sessions`.
- MCP clients can do the same with `authorize_payment`.
- `invoke_agent` or `POST /api/agents/{id}/execute` can spend that token and settle on-chain after a successful run.

Required environment for live settlement:

- `AGENTHUB_PAYMENTS_ENABLED=true`
- `AGENTHUB_PAYMENT_RPC_URL=https://node.shadownet.etherlink.com`
- `AGENTHUB_PAYMENT_CONTRACT_ADDRESS=<deployed DemoAgentPayments address>`
- `AGENTHUB_PAYMENT_SIGNER_PRIVATE_KEY=<demo payer private key>`

The current flow is intentionally demo-oriented:

- wallet ownership is not cryptographically proven yet
- spending is delegated through a backend-managed demo signer
- settlement happens after a successful run, without disputes or escrow refunds

## Migrations

```bash
cd /home/lore/workspace/AgentHub/backend
UV_CACHE_DIR=/tmp/uv-cache ~/.local/bin/uv run alembic -x env=.env.local upgrade head
```

Alembic now supports both:

- `alembic -x env=.env.local upgrade head`
- `AGENTHUB_DATABASE_URL=... alembic upgrade head`

The FastAPI app still reads values from the process environment only. Use `backend/.env.example` as the documented template, and let your execution context load either `backend/.env.local` or `backend/.env.prod` as appropriate.

`POST /api/agents/{id}/execute` uses the shared LLM runtime. For real model execution you must provide `OPENROUTER_API_KEY`. The test suite stubs the provider, so tests do not require live model access.

The backend no longer creates tables or imports example agents on startup. Run `alembic -x env=.env.local upgrade head` before starting the API, and run the separate loader if you want the local example agents written into the database.

## Tool Image Prep

For local demo workflows, `load-sync` runs with `--tool-image-mode build-local`, which builds tool images from any packaged Dockerfile and tags them under `agenthub-local/...`.

For later Hetzner/Coolify deployment, the intended path is to push approved tool images to an OCI registry and then run the loader in `declared` mode so it stores the `agent.yaml` image reference without rebuilding.

When the schema changes:

1. Update the SQLAlchemy models.
2. Create a new Alembic revision.
3. Commit that migration file.
4. Restart the local stack or rerun the migration job so `alembic -x env=.env.local upgrade head` applies it.
