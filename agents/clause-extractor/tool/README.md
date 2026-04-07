# Clause Extractor Tool

This tool bundle is the deterministic helper used by the `clause-extractor` demo agent.

It is designed for the MVP's one-shot container execution model:

- input arrives as JSON on stdin
- the tool writes JSON to stdout
- the container exits immediately after processing

## Supported Input

```json
{
  "text": "contract or policy text"
}
```

## Supported Output

```json
{
  "clauses": [
    {
      "type": "termination",
      "title": "Termination for material breach",
      "text": "Customer may terminate for material breach if the vendor fails to cure within 30 days of written notice.",
      "confidence": 0.97
    }
  ],
  "tool_version": "0.1.0"
}
```

## Local Build

```bash
docker build -t agenthub/clause-tools:0.1.0 agents/clause-extractor/tool
```

## Local Run

```bash
docker run --rm -i agenthub/clause-tools:0.1.0 < agents/clause-extractor/tool/test-input.json
```
