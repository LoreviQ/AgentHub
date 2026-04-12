# Production Docker Deployment

This repo now includes a conservative production stack in
`docker-compose.build.yml` and `docker-compose.deploy.yml`.

The production-friendly flow is:

- build and push the backend image to an OCI registry
- build and push the frontend image to an OCI registry
- build and push any packaged tool image to an OCI registry
- point Coolify at those pushed image tags with `docker-compose.deploy.yml`

Using host-local image tags such as `agenthub-backend:local` can work on a
single machine, but it is brittle with Coolify because redeploys commonly
expect pullable image references.

The deployment setup still does not automatically:

- run Alembic migrations
- load the demo agents

That keeps the first external deployment safer and easier to reason about, but
it means there is one short post-deploy setup step for migrations.

## Prepare Registry Image Tags

1. Copy `.env.prod.example` to `.env.prod`.
2. Replace the example image tags with real registry paths, for example:

```bash
AGENTHUB_BACKEND_IMAGE=ghcr.io/your-org/agenthub-backend:latest
AGENTHUB_FRONTEND_IMAGE=ghcr.io/your-org/agenthub-frontend:latest
CLAUSE_TOOL_IMAGE=ghcr.io/your-org/agenthub-clause-tools:0.1.0
```

3. Update [agents/clause-extractor/agent.yaml](/home/lore/workspace/AgentHub/agents/clause-extractor/agent.yaml)
   so `tools.items[0].image` matches `CLAUSE_TOOL_IMAGE`.

The loader stores the exact image string from `agent.yaml` when you use
`--tool-image-mode declared`, so those values must match.

## Build And Push Images

Log in to your registry on the machine that will build the images, then run:

```bash
./scripts/publish_images.sh
```

That helper:

- builds the backend and frontend images using `.env.prod`
- pushes `AGENTHUB_BACKEND_IMAGE`
- pushes `AGENTHUB_FRONTEND_IMAGE`
- builds the clause extractor tool image
- pushes `CLAUSE_TOOL_IMAGE`

## Paste The Deploy Compose Into Coolify

Create a new `Docker Compose Empty` service in Coolify and paste in
`docker-compose.deploy.yml`.

Then set the Coolify environment values, especially:

- `POSTGRES_PASSWORD`
- `OPENROUTER_API_KEY`
- `AGENTHUB_BACKEND_IMAGE`
- `AGENTHUB_FRONTEND_IMAGE`
- `NEXT_PUBLIC_GIT_REPO_URL`
- `NEXT_MCP_ADDRESS`
- `NEXT_PUBLIC_AGENTHUB_PUBLIC_API_URL`

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

That means the clause extractor tool image only needs to be available to the
server's Docker engine under the tag stored in the database. The easiest way to
guarantee that with Coolify is to publish the tool image to a registry first
and keep the registry tag in `agent.yaml`.

## Post-Deploy Setup

After Coolify starts the stack, run the migration job once on the server:

```bash
docker run --rm \
  --network host \
  --env-file .env.prod \
  "${AGENTHUB_BACKEND_IMAGE}" \
  alembic upgrade head
```

If your database is running in a Docker bridge network instead of on the host,
replace `--network host` with the correct Docker network and make sure
`AGENTHUB_DATABASE_URL` points at the reachable Postgres hostname.

If you later seed demo agents remotely, the important production rule is still:

- publish any tool image first
- keep the final registry tag in `agent.yaml`
- run the loader in `declared` mode

That way the backend stores a pullable image reference and can execute the tool
container via the mounted Docker socket.

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
