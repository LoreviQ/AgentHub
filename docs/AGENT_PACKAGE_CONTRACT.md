# Agent Package Contract

This document defines the MVP package format introduced in Step 1 of the execution plan.

The goal of the contract is to keep agent packaging intentionally small, inspectable, and easy for the backend to validate. Every packaged agent should be representable entirely by files on disk before we build the runtime loader.

## Package Layout

Each agent lives in its own directory under `agents/`.

```text
agents/
  _template/
    agent.md
    agent.yaml
    example-input.txt
    example-response.json
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

## Required Files

### `agent.md`

Human-readable instructions for the shared runtime.

Required responsibilities:

- define the agent's purpose and boundaries
- provide the operating instructions the runtime will use
- describe expected input shape
- describe expected output shape
- document any execution caveats for humans reviewing the package

Recommended section shape:

```markdown
# Agent Name

## Purpose

## Operating Instructions

## Input Contract

## Output Contract

## Failure Handling
```

### `agent.yaml`

Machine-readable runtime configuration for validation and execution.

This file is the source of truth for:

- package identity
- model selection
- output and input modes
- timeout and execution policy
- whether tools are enabled
- which tool declarations are available to this package
- public instructions shown on the website or returned by the API

The schema lives at [schemas/agent.schema.json](/home/lore/workspace/agenthub/schemas/agent.schema.json).

## Required Metadata Fields

The MVP contract requires the following top-level fields:

- `schema_version`: package contract version, starting at `1`
- `id`: stable slug used in URLs and API routes
- `name`: human-facing display name
- `description`: short public description
- `version`: package version string
- `model`: provider and model settings
- `runtime`: execution controls owned by the platform
- `io`: declared input and output modes
- `tools`: tool enablement and declarations
- `public_instructions`: public invocation guidance for humans and other assistants

## Model Configuration

The MVP allows these model settings to be configured per agent:

- `model.provider`
- `model.name`
- `model.temperature`
- `model.max_tokens`

We should keep this narrow for now. If additional inference controls are needed later, we can extend the schema version rather than letting the contract drift ad hoc.

## Runtime Configuration

The MVP runtime block is intentionally platform-shaped.

Supported fields:

- `runtime.timeout_seconds`
- `runtime.internet_access`
- `runtime.execution_notes`

These settings describe the execution envelope without exposing arbitrary infrastructure control.

## Input And Output Configuration

The MVP supports only a small set of formats.

Supported values:

- `io.input_mode`: `text`
- `io.output_mode`: `markdown` or `json`

If we later support file uploads or richer schemas, those should be introduced explicitly in a new schema revision.

## Tool Declaration Contract

Tool usage is explicit and deny-by-default.

Required fields:

- `tools.enabled`: boolean
- `tools.items`: array of tool declarations, empty when tools are disabled

Each tool declaration includes:

- `name`: stable tool name exposed to the runtime
- `description`: short explanation of what the tool does
- `image`: OCI image reference used for execution
- `entrypoint`: command run inside the tool container
- `input_format`: currently `json`
- `output_format`: currently `json`
- `timeout_seconds`: per-tool execution timeout

Rules:

- if `tools.enabled` is `false`, `tools.items` must be empty
- if `tools.enabled` is `true`, at least one tool must be declared
- tool declarations are package-local and must be approved by the platform before execution

## Validation Expectations

For a package to be considered valid in the MVP:

1. `agent.yaml` must satisfy the JSON schema
2. `agent.md` must exist
3. example input and output files should exist for documentation and demoability
4. the package must be representable without hidden local dependencies

## Exit Criteria Mapping

Step 1 is complete when:

- both demo agents can be represented by this directory shape
- the schema is specific enough for backend validation work in Step 3
- tool-enabled and tool-free agents both fit the same top-level contract
