# Production Docker Deployment

This repo now includes a conservative production stack in
`docker-compose.build.yml` and `docker-compose.deploy.yml`.

The intended split is:

- `docker-compose.build.yml`: build the backend and frontend images on the server
- `docker-compose.deploy.yml`: paste into Coolify so it deploys those images

The deployment setup still does not automatically:

- run Alembic migrations
- load the demo agents
- mount `/var/run/docker.sock`
- build or pull packaged tool images

That keeps the first external deployment safer and easier to reason about.

## Build The Images On The Server

1. Copy `.env.prod.example` to `.env.prod`.
2. Fill in at least:
   - `NEXT_PUBLIC_GIT_REPO_URL`
   - `NEXT_PUBLIC_AGENTHUB_PUBLIC_API_URL`
3. Start the stack:

```bash
docker compose --env-file .env.prod -f docker-compose.build.yml build
```

That produces the local server images referenced by default in the deploy file:

- `agenthub-backend:local`
- `agenthub-frontend:local`

## Paste The Deploy Compose Into Coolify

Create a new `Docker Compose Empty` service in Coolify and paste in
`docker-compose.deploy.yml`.

Then set the Coolify environment values, especially:

- `POSTGRES_PASSWORD`
- `OPENROUTER_API_KEY`
- `NEXT_PUBLIC_GIT_REPO_URL`
- `NEXT_MCP_ADDRESS`
- `NEXT_PUBLIC_AGENTHUB_PUBLIC_API_URL`

If you keep the default image names, Coolify should use:

- `agenthub-backend:local`
- `agenthub-frontend:local`

## Recommended Public Domains

If you want:

- frontend at `agenthub.oliver.tj`
- backend at `agenthubapi.oliver.tj`

use these environment values:

```bash
AGENTHUB_BACKEND_URL=http://backend:8000
NEXT_MCP_ADDRESS=https://agenthubapi.oliver.tj/mcp/
NEXT_PUBLIC_AGENTHUB_PUBLIC_API_URL=https://agenthubapi.oliver.tj
```

The frontend should still talk to the backend over the internal Docker network.
Only public-facing URLs should point at `agenthubapi.oliver.tj`.

The backend service in `docker-compose.deploy.yml` mounts
`/var/run/docker.sock` so the tool-enabled demo agent can run its packaged tool
container on the server.

## Important Loader Caveat

Running the loader from your local machine against the remote database can work
for metadata, but there is one important catch:

- if you use `--tool-image-mode build-local`, the clause-extractor tool image is
  built on your local Docker engine, not on the server
- the remote backend will not be able to execute that local-only image

So for the remote deployment, local loading is only safe if one of these is
true:

- you load only the non-tool agent first
- the tool image is already pushed to a registry and the loader runs in
  `declared` mode

## Suggested Next Step

After the blank deploy is up, the clean follow-up is to add one of:

1. a one-shot migration job and one-shot remote loader job
2. registry-backed tool images so remote loading can use `declared` mode
