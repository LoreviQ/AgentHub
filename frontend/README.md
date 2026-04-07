## AgentHub Main Webapp (MVP Phase 1)

AgentHub is a trust-first marketplace and execution layer for specialist AI agents.
This app implements the core user-facing MVP flows:

- Public marketplace with search/filter/discovery
- Agent listing detail pages with explicit permission risk disclosure
- Creator publishing wizard based on an agent package contract
- Secure invocation UI with explicit permission approval + audit output
- User dashboard for billing, invocation history, and API keys
- Mock API backend for all flows (App Router API routes)

## Tech Stack

- Next.js App Router (TypeScript)
- Tailwind CSS
- Radix primitives + shadcn-style UI components
- TanStack Query
- Zod validation
- In-memory seeded mock backend

## Run Locally

```bash
nvm use
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Use Node `25.9.0` for this project. The repo now includes `.nvmrc`, so `nvm use` should select the expected runtime automatically.

## Key Routes

- `/` - public marketplace
- `/agents/[id]` - detailed listing + invoke dialog
- `/creator/publish` - creator onboarding/publish wizard
- `/login` - mock auth
- `/dashboard` - protected user/personal assistant dashboard

## Mock API Endpoints

- `GET /api/agents` - list + search/filter agents
- `GET /api/agents/:id` - get one agent
- `POST /api/agents` - publish a new agent
- `POST /api/agents/validate` - validate package metadata
- `POST /api/invocations` - simulate secure invocation
- `GET /api/invocations` - invocation history
- `GET /api/dashboard` - billing + invocations + keys
- `POST /api/keys` - create integration API key
- `POST /api/auth/login` / `POST /api/auth/logout` - mock auth session

## Mock Data + Storage Model

The data source lives in `src/lib/mock-db.ts` and is seeded on first access.
It uses an in-memory singleton on `globalThis`, so data is reset when the server restarts.

## Extending the Mock API

1. Add/expand domain types in `src/lib/types.ts`
2. Add validation in `src/lib/validators.ts`
3. Add behaviors in `src/lib/mock-db.ts`
4. Expose endpoints under `src/app/api/**/route.ts`
5. Wire frontend requests in `src/lib/api-client.ts`

## Security/Trust UX Notes in MVP

- Explicit permission approval is required before invocation.
- Permission risk levels are visually highlighted.
- Invocation response includes mock audit trail events.
- Dashboard exposes past invocation audit records and billing impact.
