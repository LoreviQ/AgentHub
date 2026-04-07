# AgentHub MVP Execution Plan

## MVP Goal

The MVP is not a full marketplace.

The goal is to prove one narrow but important claim:

AgentHub can host preconfigured third-party-style agents, spin them up from packaged components inside a controlled environment, expose them through a simple execution API, and make them easy for a human or another assistant to invoke.

For this MVP we only need to demonstrate:

- 2 preconfigured agents installed on the platform
- agent definitions composed from markdown instructions, config, and executable runtime components
- demonstrable spin-up and execution of both agents
- a simple website showing each agent, what it does, and how to use it
- a copy-to-clipboard command block for each agent
- an example of a separate assistant using that instruction to call one of our agents

We do not need to build:

- creator upload flows
- payments
- discovery APIs
- open publishing
- ratings and reviews

## Core Execution Model

The MVP should use one shared agent execution loop for every agent.

That shared runtime is responsible for:

- loading `agent.md`
- loading `agent.yaml`
- assembling context
- selecting the model/provider
- running the LLM interaction
- deciding whether any custom tools should be called

The difference between the two demo agents is not a different top-level execution path.

The difference is:

- Agent 1 uses only prompt + model
- Agent 2 uses prompt + model + optional custom tool calls

This is a better representation of the product:

- all agents are executed through the same platform-controlled LLM runtime
- some agents are purely prompt-driven
- some agents are augmented with creator-defined tools
- the platform decides how those tools are exposed safely

## Demo Workflow To Prove

This is the exact workflow the MVP should support.

1. Two agents are preloaded into AgentHub by us.
2. Each agent is defined by a small bundle of files:
   `skill.md` or `agent.md`, config file, runtime image reference, and any execution metadata.
3. The platform lists both agents on a simple website.
4. A user opens the site and reads:
   what the agent does, what model it uses, expected input, and any execution notes.
5. The user clicks a copy button that copies the invocation instruction for their own assistant.
6. The user pastes that instruction into a separate assistant.
7. That assistant calls the AgentHub execution endpoint for the chosen agent.
8. AgentHub spins up the agent, executes it on the Hetzner server, and returns the result.
9. The result proves that the agent ran from packaged platform-controlled components rather than ad hoc local code.

## What We Are Building

The MVP is a curated demo platform with four parts:

- a static set of two agent packages stored in the repo or on the server
- a backend service that can load, validate, and run those packages
- a simple frontend that presents the agents and gives usage instructions
- a small API surface that a separate assistant can call

This should feel like the first slice of a marketplace, but without the marketplace machinery.

## Recommended MVP Scope

### Included

- exactly 2 agents
- one server environment on Hetzner
- one supported packaging format
- one execution API
- one simple website
- copy-command UX for users
- example external assistant invocation
- basic run logging

### Explicitly Deferred

- creator onboarding
- agent uploads
- billing and payouts
- marketplace search
- automated reviews
- user accounts
- crypto flows
- complex permission marketplace logic

## Proposed Demo Agents

The actual agent content can change, but the two agents should be meaningfully different so the platform looks real.

Demo setup:

### Agent 1: Legal Document Concern Checker

Purpose:

- takes a block of legal text or uploaded document text
- returns key concerns, risky clauses, and suggested follow-up questions

Why it is good for the demo:

- clear privacy-sensitive use case
- aligns with the trust narrative
- easy to understand in a product demo

Execution type:

- LLM-only

### Agent 2: Clause Extractor Assistant

Purpose:

- accepts legal or policy text
- uses the shared LLM runtime to decide whether to call one or more custom text-processing tools
- returns structured extraction results plus a short explanation

Why this is a good custom-code demo:

- it proves the platform can execute creator-defined code, not just prompts
- it shows the LLM can selectively invoke tools depending on the delegated task
- it creates a clear product story around specialised logic
- it maps directly to the A2A thesis

Why it is good for the demo:

- shows that AgentHub can host more than one specialist agent
- demonstrates the custom-code USP directly

Execution type:

- shared LLM runtime with custom tools

## Agent Package Format For MVP

We should keep the package format intentionally small and opinionated.

Each agent should be represented by a directory such as:

```text
agents/
  legal-checker/
    agent.md
    agent.yaml
    example-input.txt
    example-response.json
  clause-extractor/
    agent.md
    agent.yaml
    example-input.txt
    example-response.json
```

If custom tool logic is needed, the agent package can also reference a custom tool image and tool configuration.

### Required Files

`agent.md`

- human-readable description of the agent
- system prompt or operating instructions
- how the agent should behave
- input and output expectations

`agent.yaml`

- machine-readable runtime config
- selected model
- temperature and token settings
- tool access policy
- custom tool/image reference
- timeout and resource limits

Optional supporting files:

- example inputs
- example outputs
- schema definitions
- small helper scripts or runtime metadata

## Suggested `agent.yaml` Shape

The exact format can evolve, but for the MVP it should include:

- `id`
- `name`
- `description`
- `model`
- `temperature`
- `max_tokens`
- `timeout_seconds`
- `tools_enabled`
- `tool_image`
- `tool_entrypoint`
- `input_mode`
- `output_mode`
- `internet_access`
- `public_instructions`

Example shape:

```yaml
id: legal-checker
name: Legal Document Concern Checker
description: Reviews legal text and flags concerns.
model: gpt-5-mini
temperature: 0.2
max_tokens: 1800
timeout_seconds: 60
tools_enabled: false
input_mode: text
output_mode: markdown
internet_access: false
public_instructions: |
  Send a POST request to /api/agents/legal-checker/execute with the user text.
```

Tool-enabled example shape:

```yaml
id: clause-extractor
name: Clause Extractor Assistant
description: Extracts structured clauses and key metadata from contract text.
model: gpt-5-mini
temperature: 0.1
max_tokens: 1800
timeout_seconds: 60
tools_enabled: true
tool_image: ghcr.io/agenthub/clause-tools:latest
tool_entrypoint: python /app/main.py
input_mode: text
output_mode: json
internet_access: false
public_instructions: |
  Send a POST request to /api/agents/clause-extractor/execute with the document text.
```

## Execution Model

For the MVP, the important thing is not perfect generality. The important thing is demonstrable controlled execution.

### Shared LLM Runtime Path

Execution model:

- the backend reads agent metadata from disk or a small registry database
- it assembles the final prompt from `agent.md`, stored context, and request input
- it selects the provider and model from `agent.yaml`
- it creates the agent execution context
- it runs the LLM through a platform-owned provider integration such as OpenRouter
- if tool access is enabled, it exposes only that agent’s declared tools to the runtime
- the LLM may call those tools or may answer directly
- it returns the formatted result and logs the run

Implementation:

- `FastAPI` for the HTTP API
- `Pydantic` for config validation
- `PydanticAI` for the model invocation and tool-calling layer

Implementation rationale:

- it is designed as a Python agent framework
- it supports multiple model providers
- its official docs show built-in support for `OpenRouter`
- it works naturally with typed request and response models
- it is well suited to agents that may optionally call tools

Based on the current official docs, PydanticAI supports multiple providers and documents both OpenRouter integration and OpenAI-compatible provider patterns.

### Tool Execution Path

Execution model:

- the shared LLM runtime remains the orchestrator for every agent
- if the agent has declared custom tools, the runtime can call them during the run
- those tools should execute outside the shared runtime process
- the tool result is returned to the LLM runtime
- the LLM uses that tool output to produce the final response

This preserves the product shape you want:

- every agent is still fundamentally an LLM agent
- custom code is an optional augmentation
- the custom code is called only when the agent decides it is needed

## Tool Execution Design

The MVP will use one-shot container jobs for custom tools.

This avoids:

- network topology decisions
- service discovery
- per-agent port management
- long-running container lifecycle
- additional isolation complexity

Implementation:

- the shared LLM runtime invokes a tool adapter
- the tool adapter starts a short-lived container job when a tool call is needed
- the tool input is passed through stdin, env, mounted file, or a temp volume
- the tool result is captured from stdout or a written output file
- the container is stopped and removed after the tool call completes

Implementation benefits:

- no always-on internal HTTP service required
- no custom per-agent Docker network required
- cleaner spin-up/down story for tool execution
- much easier to audit and demonstrate
- closer to a secure job execution model

## Runtime Architecture

The MVP will use a small multi-service architecture.

Core services:

- web application
- backend and shared agent runner
- PostgreSQL database
- container image registry for tool images

The backend API and shared LLM runtime will live in a single service for the MVP.

### Web Application Service

- React with Vite
- public agent pages
- copy-to-clipboard UX
- example invocation flows

### Backend And Shared Agent Runner Service

- FastAPI API server
- agent registry loader
- shared LLM execution loop using PydanticAI
- tool dispatcher
- run logging

This is one service in the MVP. It owns:

- public API endpoints
- agent loading and validation
- model execution
- tool invocation
- persistence writes

This keeps the first build simpler. If needed later, the API layer and runner can be separated into independent services.

### Database Service

- PostgreSQL
- SQLAlchemy models and sessions
- Alembic migrations
- run logs
- agent metadata and versions
- future support for richer registry state

### Image Registry

- stores tool container images referenced by `agent.yaml`
- provides pullable image tags for runtime execution

For the MVP, this should use an existing registry rather than building a custom artifact repository.

Preferred options:

- GitHub Container Registry
- Docker Hub private repositories
- a self-hosted OCI registry only if required by deployment constraints

### Agent 1

- prompt + model only
- no custom tools enabled

### Agent 2

- prompt + model
- one or more custom tools declared in config
- tools executed through the platform tool dispatcher

Resulting control plane:

- one API
- one registry format
- one shared LLM runtime
- optional tool execution when declared by the agent

## Tool Container Strategy

### Shared Runtime

- runs in the backend service
- handles all agent requests
- invokes tools only when needed

### Custom Tools

- one tool image per tool bundle, or one shared tool-runner image if code shape stays uniform
- stored in an OCI-compatible image registry
- launched with `docker run --rm` or equivalent SDK call
- input mounted or piped in
- output read back by the backend
- container removed after completion

Build rules:

- one shared execution path for all agents
- short-lived tool containers only for agents that declare tools
- no long-lived internal tool services in the MVP

## Deployment Environment

The MVP will run on the existing Hetzner server and be managed through Coolify.

Deployment shape:

- Coolify as the deployment and routing layer
- Hetzner VPS or dedicated box as the execution host
- Docker for packaging and runtime isolation
- Coolify-managed application services and networking
- PostgreSQL deployed as a managed service within Coolify or attached externally
- public routing handled by Coolify

Deployments to configure in Coolify:

- `frontend` service
- `backend` service
- `postgres` service
- optional worker or scheduled service later if background execution is introduced

This is enough for an MVP and keeps operational complexity low.

## Secure Execution Approach

The MVP security model should focus on controlled execution rather than overclaiming confidential computing.

Security controls to implement:

- all agent requests enter through the shared backend service
- only tool images explicitly declared in `agent.yaml` may be executed
- tool containers run as short-lived one-shot jobs
- internet access is disabled for tool containers unless explicitly required later
- tool containers receive only the minimum input required for the tool call
- tool containers are removed immediately after execution
- resource limits are applied to CPU, memory, runtime duration, and filesystem usage
- backend-held provider credentials are never passed directly into tool containers
- run metadata is logged for auditability

Container runtime rules:

- run as non-root where possible
- use read-only root filesystem where possible
- mount only temporary working data
- disable privileged mode
- drop unnecessary Linux capabilities
- enforce timeout-based termination

Platform boundary for the MVP:

- the backend service is trusted platform code
- tool images are approved demo artifacts
- arbitrary user-uploaded code is out of scope

This gives the MVP a credible secure execution story:

- all LLM activity is platform mediated
- creator-defined code is isolated from the shared runtime
- custom code runs with narrow permissions and short lifetimes

## Technology Stack

The stack should optimise for fast delivery, clarity, and easy demoability.

### Backend

Backend stack:

- `FastAPI` for the API server
- `Pydantic` for agent config validation
- `PydanticAI` for shared LLM execution
- `SQLAlchemy` for ORM and DB access
- `Alembic` for schema migrations
- `Uvicorn` for serving

Why this backend:

- fast to build
- strong typed request/response models
- simple JSON API support
- easy docs and testability
- natural fit for provider-swappable model execution

### Frontend

Frontend stack:

- `React`
- `Vite`
- standard browser Clipboard API

Chosen direction:

- frontend: `React` with `Vite`
- backend: `FastAPI`

That gives a clean split between the demo website and the execution engine.

### Execution Layer

Execution stack:

- Docker containers
- platform-owned model API integration for all agents
- short-lived container jobs for custom tools

### Persistence

Persistence:

- `PostgreSQL` for run logs and agent registry metadata
- `SQLAlchemy` for persistence layer
- `Alembic` for schema migrations

Why this persistence choice:

- closer to the production direction
- better fit for evolving agent metadata and run history
- integrates cleanly with Coolify deployments

### Clipboard and Demo UX

Clipboard and demo UX:

- standard browser Clipboard API
- prebuilt “copy command” block on each agent page
- sample `curl` and assistant instruction snippets

## API Shape For MVP

We only need a very small API.

### Read Agents

`GET /api/agents`

Returns:

- agent id
- name
- description
- model
- input format
- execution notes

### Read Agent Detail

`GET /api/agents/:id`

Returns:

- public agent metadata
- how to use it
- example request
- example response
- whether custom tools are used

### Execute Agent

`POST /api/agents/:id/execute`

Request body:

- user input
- optional metadata

Response:

- agent id
- status
- output
- run id
- duration
- tool_calls_used

### Optional Demo Run History

`GET /api/runs/:id`

Useful for debugging and demos, but not required on day one.

## Website Requirements

The site should be intentionally simple.

Required pages:

### Home Page

- short explanation of AgentHub
- list of the two available agents
- link to each agent detail page

### Agent Detail Page

For each agent show:

- title
- short description
- what it is good for
- model and settings summary
- expected input
- example output
- execution endpoint
- “how to use” instructions
- copy-to-clipboard block

### Copy Command Block

This is one of the most important demo elements.

It should copy either:

- a `curl` command
- or a plain-English instruction block for a personal assistant

Recommended to show both.

Example plain-English instruction:

```text
When you need legal document risk analysis, call the AgentHub agent at:
POST https://agenthub.example.com/api/agents/legal-checker/execute

Send the user’s document text as JSON:
{ "input": "<document text>" }

Return the response to the user as a concise summary with bullet points.
```

Example `curl` block:

```bash
curl -X POST https://agenthub.example.com/api/agents/legal-checker/execute \
  -H "Content-Type: application/json" \
  -d '{ "input": "Paste legal text here" }'
```

## Example External Assistant Flow

We should explicitly include one demo showing a separate assistant using the copied instruction.

Recommended demonstration:

1. Open the AgentHub website.
2. Open the legal-checker agent page.
3. Copy the assistant instruction block.
4. Paste it into another assistant’s context.
5. Ask that assistant to review a sample contract.
6. That assistant calls the AgentHub execution endpoint.
7. AgentHub returns the result.
8. The assistant presents the specialist output back to the user.

For the MVP site, it would be helpful to include:

- a screenshot or transcript of this flow
- or a dedicated “Example invocation” section on the agent detail page

## Security Positioning For This MVP

We should be careful not to overclaim security before the platform is mature.

What we can credibly claim in the MVP:

- execution happens on infrastructure we control
- agents run from preconfigured platform-managed components
- internet access can be disabled by default
- runtime is isolated at the container level
- model access is mediated by our backend

What we should not yet claim:

- production-grade confidential computing
- full multi-tenant hardening
- open untrusted code execution at scale
- enterprise-grade compliance guarantees

The message should be:

This MVP demonstrates the control plane and execution pattern for secure third-party agent hosting. It is the first step toward a stronger trust model.

## Build Plan

This is the recommended execution order for delivering the MVP.

### Step 1: Define The Agent Package Contract

Deliverables:

- `agent.md` template
- `agent.yaml` schema
- directory structure for packaged agents
- explicit tool declaration fields

Decisions:

- what fields are required
- what model settings are configurable
- what tool declarations are configurable

Exit criteria:

- both demo agents can be represented entirely by this format

### Step 2: Create The Two Demo Agents

Deliverables:

- `legal-checker` package
- `clause-extractor` or similar tool-enabled package
- example inputs and outputs

Work:

- write prompts/instructions
- choose model and settings
- define public usage text
- define tool image contract for the second agent

Exit criteria:

- both agents are fully defined on disk and can be loaded by code

### Step 3: Build The Backend Registry Loader

Deliverables:

- backend code that scans the `agents/` directory
- config validation
- PostgreSQL-backed agent registry metadata

Work:

- load YAML
- load markdown instructions
- validate agent metadata
- define SQLAlchemy models
- create Alembic migrations
- expose read endpoints

Exit criteria:

- `GET /api/agents` and `GET /api/agents/:id` work

### Step 4: Build Shared LLM Execution

Deliverables:

- `POST /api/agents/:id/execute`
- provider abstraction
- OpenRouter-backed execution path
- run logging

Work:

- assemble prompt from config and markdown
- call model through PydanticAI
- return structured output
- store minimal run records

Exit criteria:

- the first demo agent runs successfully via the API

### Step 5: Build Tool Invocation For The Second Agent

Deliverables:

- tool dispatcher
- input/output contract for tool containers
- run logging
- timeout and error handling

Work:

- expose declared tools to the shared LLM runtime
- launch short-lived tool containers when tools are called
- pass tool input into the image
- capture tool output back into the runtime
- enforce execution timeout and cleanup

Exit criteria:

- the second demo agent can selectively call its custom tool and complete successfully

### Step 6: Add Deployment Packaging

Deliverables:

- Dockerfiles and deployment config for Coolify
- backend container
- frontend container
- PostgreSQL service definition
- any required tool image definitions

Work:

- define shared platform services
- define tool image build path
- configure secrets and environment variables
- configure Coolify service routing
- configure database connection and migrations

Exit criteria:

- the full stack can be deployed through Coolify on the Hetzner host

### Step 7: Build The Demo Website

Deliverables:

- home page
- agent detail pages
- copy command block
- example request and response sections

Work:

- fetch agent metadata from backend
- render agent cards
- implement clipboard copy action
- present clear usage instructions

Exit criteria:

- a user can browse the two agents and copy invocation instructions

### Step 8: Deploy To Hetzner

Deliverables:

- running backend
- running frontend
- reverse proxy and TLS
- environment configuration

Work:

- configure Coolify deployment targets
- configure domain and HTTPS in Coolify
- store API keys securely in server env
- verify execution from the public URL

Exit criteria:

- the demo is accessible externally and both agents can be invoked live

### Step 9: Create The Separate Assistant Demo

Deliverables:

- one polished example of a separate assistant invoking an AgentHub agent
- transcript, screenshot, or short walkthrough

Work:

- copy instruction from the site
- paste into another assistant
- submit sample user task
- capture the successful result

Exit criteria:

- a third party can understand the A2A usage pattern from the demo alone

## Concrete Technical Decisions

To keep momentum high, these are the defaults I would use unless we discover a blocker.

- Backend: `FastAPI`
- LLM framework: `PydanticAI`
- Frontend: `React` with `Vite`
- Runtime packaging: `Docker`
- Persistence: `PostgreSQL`
- ORM: `SQLAlchemy`
- Migrations: `Alembic`
- Image registry: `GHCR` or another OCI-compatible registry
- Deployment platform: `Coolify`
- Server: existing Hetzner host
- Agent config: `YAML`
- Agent instructions: `Markdown`

## Folder Structure Recommendation

Suggested repo structure for implementation:

```text
backend/
frontend/
agents/
  legal-checker/
    agent.md
    agent.yaml
    example-input.txt
    example-output.md
  clause-extractor/
    agent.md
    agent.yaml
    example-input.txt
    example-output.md
docker/
  base-runtime/
docs/
```

## Definition Of Done

The MVP is done when all of the following are true:

- two agent packages exist and are readable from config + markdown files
- one agent runs through prompt + model only
- one agent runs through prompt + model with custom tool access
- execution can be demonstrated on the Hetzner server
- the website shows both agents and their usage details
- each agent page includes a copy-to-clipboard invocation block
- a separate assistant can use the copied instruction to call at least one AgentHub agent successfully

## Final Recommendation

The most important product choice is to frame this as a hosted agent execution demo, not as a tiny version of the full marketplace.

That means we should optimise for:

- clarity of packaging
- credibility of execution
- polished invocation UX
- one clean A2A demonstration
- a clear demonstration that shared LLM execution can optionally call creator-defined tools

If we do those well, we will have a convincing MVP that proves the core AgentHub thesis without getting dragged into upload flows, payments, or marketplace complexity too early.
