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

Recommended setup:

### Agent 1: Legal Document Concern Checker

Purpose:

- takes a block of legal text or uploaded document text
- returns key concerns, risky clauses, and suggested follow-up questions

Why it is good for the demo:

- clear privacy-sensitive use case
- aligns with the trust narrative
- easy to understand in a product demo

### Agent 2: Contract Comparison or Policy Review Agent

Purpose:

- either compares two contract versions
- or reviews policy text against a fixed checklist

Why it is good for the demo:

- shows that AgentHub can host more than one specialist agent
- demonstrates a second workflow without needing a different platform architecture

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
  policy-reviewer/
    agent.md
    agent.yaml
    example-input.txt
    example-response.json
```

If custom execution logic is needed, the agent package can also reference a shared container image or an agent-specific image.

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
- endpoint metadata
- container/image reference
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
- `container_image`
- `entrypoint`
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
container_image: ghcr.io/agenthub/base-agent:latest
entrypoint: /app/run-agent
input_mode: text
output_mode: markdown
internet_access: false
public_instructions: |
  Send a POST request to /api/agents/legal-checker/execute with the user text.
```

## Execution Model

For the MVP, the important thing is not perfect generality. The important thing is demonstrable controlled execution.

Execution model:

- the backend reads agent metadata from disk
- it validates the config for known supported fields
- it starts an isolated execution for the requested agent
- it injects the agent instructions plus user input
- it calls the selected model through the platform backend
- it returns the formatted result and logs the run

The “spin up/down” story can be implemented in one of two ways:

### Option A: Shared Runtime Container Per Invocation

- one approved base image for all agents
- agent package mounted or loaded at run time
- each execution starts a short-lived container or job

Why this is recommended:

- simpler and faster for the MVP
- still demonstrates that packaged components control execution
- easier to run on a single Hetzner server

### Option B: Dedicated Image Per Agent

- each agent references its own built image
- execution starts a container from that image

Why this may be useful later:

- stronger story for heterogeneous runtimes
- closer to a future marketplace packaging model

Recommendation:

Start with Option A unless one of the demo agents truly requires custom executable code.

## Deployment Environment

We already have a Hetzner server, so the MVP should be designed around a single-host deployment.

Recommended deployment shape:

- Hetzner VPS or dedicated box as the primary execution host
- Docker for packaging and runtime isolation
- Docker Compose for service orchestration
- Nginx or Caddy as reverse proxy
- systemd or Compose restart policies for service resilience

This is enough for an MVP and keeps operational complexity low.

## Recommended Technology Stack

The stack should optimise for fast delivery, clarity, and easy demoability.

### Backend

Recommended:

- `FastAPI` for the API server
- `Pydantic` for agent config validation
- `Uvicorn` for serving

Why:

- fast to build
- strong typed request/response models
- simple JSON API support
- easy docs and testability

### Frontend

Recommended:

- `Next.js` or a simple React frontend
- or plain server-rendered templates if speed matters more than polish

Recommendation:

Use `Next.js` if you want a nicer demo experience and clipboard UX quickly.
Use server-rendered templates if you want the absolute shortest build path.

For this MVP, I would lean toward:

- frontend: `Next.js`
- backend: `FastAPI`

That gives a clean split between the demo website and the execution engine.

### Execution Layer

Recommended:

- Docker containers
- one approved base runtime image
- platform-owned model API integration

### Persistence

Recommended:

- SQLite for initial run logs and agent registry metadata

Why:

- zero ops
- perfectly adequate for a 2-agent MVP

### Clipboard and Demo UX

Recommended:

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

Decisions:

- what fields are required
- whether agents share one base image
- what execution settings are configurable

Exit criteria:

- both demo agents can be represented entirely by this format

### Step 2: Create The Two Demo Agents

Deliverables:

- `legal-checker` package
- `policy-reviewer` or `contract-comparer` package
- example inputs and outputs

Work:

- write prompts/instructions
- choose model and settings
- define public usage text

Exit criteria:

- both agents are fully defined on disk and can be loaded by code

### Step 3: Build The Backend Registry Loader

Deliverables:

- backend code that scans the `agents/` directory
- config validation
- in-memory or SQLite-backed agent registry

Work:

- load YAML
- load markdown instructions
- validate agent metadata
- expose read endpoints

Exit criteria:

- `GET /api/agents` and `GET /api/agents/:id` work

### Step 4: Build The Execution Endpoint

Deliverables:

- `POST /api/agents/:id/execute`
- run logging
- timeout and error handling

Work:

- construct runtime payload from package + user input
- call model through the backend
- return structured output
- store minimal run records

Exit criteria:

- both demo agents can be executed successfully through the API

### Step 5: Add Containerised Spin-Up/Down

Deliverables:

- container execution path for agent runs
- one base runtime image
- Docker Compose setup for local and Hetzner deployment

Work:

- define base image
- launch per-run container or job
- pass agent package/config into runtime
- clean up after execution

Exit criteria:

- a run can start, execute, and terminate from packaged components on the server

### Step 6: Build The Demo Website

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

### Step 7: Deploy To Hetzner

Deliverables:

- running backend
- running frontend
- reverse proxy and TLS
- environment configuration

Work:

- provision Docker/Compose
- configure domain and HTTPS
- store API keys securely in server env
- verify execution from the public URL

Exit criteria:

- the demo is accessible externally and both agents can be invoked live

### Step 8: Create The Separate Assistant Demo

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
- Frontend: `Next.js`
- Runtime packaging: `Docker`
- Orchestration: `Docker Compose`
- Persistence: `SQLite`
- Reverse proxy: `Caddy` or `Nginx`
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
  contract-comparer/
    agent.md
    agent.yaml
    example-input.txt
    example-output.md
docker/
  base-runtime/
docker-compose.yml
docs/
```

## Definition Of Done

The MVP is done when all of the following are true:

- two agent packages exist and are readable from config + markdown files
- both agents can be executed from the platform backend
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

If we do those well, we will have a convincing MVP that proves the core AgentHub thesis without getting dragged into upload flows, payments, or marketplace complexity too early.
