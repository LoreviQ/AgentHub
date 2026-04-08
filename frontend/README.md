## AgentHub Frontend

This frontend is the marketplace-style MVP website for AgentHub.

Current focus:

- long-form landing page explaining the trust problem and secure execution story
- marketplace page with live agent listings fetched from the backend
- richer agent detail pages with chat testing, example payloads, and copyable invocation instructions
- visual-only creator page for future marketplace onboarding
- backend-proxied frontend API routes so the site can talk to the FastAPI service

## Tech Stack

- Next.js App Router (TypeScript)
- Tailwind CSS
- Radix primitives + shadcn-style UI components
- TanStack Query
- frontend API proxy routes backed by the real backend agent API

## Run Locally

```bash
nvm use
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Use Node `25.9.0` for this project. The repo now includes `.nvmrc`, so `nvm use` should select the expected runtime automatically.

Set `NEXT_PUBLIC_GIT_REPO_URL` in `frontend/.env.local` for the repo link shown on the landing page.

## Key Routes

- `/` - long-scroll landing page
- `/marketplace` - marketplace listing page
- `/agents/[id]` - detailed listing + live test panel
- `/creator/publish` - visual-only creator flow
- `/login` - mock auth
- `/dashboard` - protected user/personal assistant dashboard

## Frontend API Routes

- `GET /api/agents` - list + search/filter agents
- `GET /api/agents/:id` - get one agent
- `POST /api/agents/:id/execute` - execute one live agent
- `POST /api/agents` - publish a new agent
- `POST /api/agents/validate` - validate package metadata
- `POST /api/invocations` - simulate secure invocation
- `GET /api/invocations` - invocation history
- `GET /api/dashboard` - billing + invocations + keys
- `POST /api/keys` - create integration API key
- `POST /api/auth/login` / `POST /api/auth/logout` - mock auth session

## Deployment

- `docker/frontend/Dockerfile` builds and serves the Next.js app
- `docker-compose.yml` now includes the `frontend-web` service
- the frontend container talks to the backend through `AGENTHUB_BACKEND_URL`
