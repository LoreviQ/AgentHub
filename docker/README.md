# Docker Packaging

This directory holds the platform-level container packaging for the AgentHub MVP.

## Shared Backend Image

`docker/backend/Dockerfile` is the single shared application image for:

- the standalone backend API service
- the one-shot Alembic migration job
- the one-shot local agent loader (`load-sync`)

We do not need separate Dockerfiles for those services yet because they all run the same Python application environment with different commands.

## Tool Images

Packaged tools keep their own Dockerfiles inside each agent package, for example:

- `agents/clause-extractor/tool/Dockerfile`

That split is intentional:

- platform services share one image
- creator-defined tools stay packaged with their agent bundle

## Registry Prep

For local demo workflows, `load-sync` can build packaged tool images into the local Docker engine and tag them with `agenthub-local/...`.

For deployment on Hetzner/Coolify, the preferred path is:

1. build each approved tool image ahead of time
2. push it to an OCI registry reachable from the host
3. keep that registry image reference in `agent.yaml`
4. run `load-sync` in `declared` mode so the loader stores the declared image reference without rebuilding it

That gives us a clean bridge from local demo packaging to production-friendly image distribution without changing the runtime contract.

## Production Baseline Stack

The repo also includes [docker-compose.prod.yml](/home/lore/workspace/AgentHub/docker-compose.prod.yml)
for a conservative external deployment with:

- PostgreSQL
- backend API
- frontend

It intentionally does not run migrations or the agent loader automatically. See
[PROD_DOCKER_DEPLOYMENT.md](/home/lore/workspace/AgentHub/docs/PROD_DOCKER_DEPLOYMENT.md)
for the runbook and the caveat around loading tool-enabled agents into a remote
environment.
