import json
import re
import sys
from typing import Dict, List


TOOL_VERSION = "0.1.0"


CLAUSE_PATTERNS = [
    {
        "type": "termination",
        "title": "Termination for material breach",
        "patterns": [r"\bterminate\b", r"\bmaterial breach\b", r"\bcure\b"],
        "base_confidence": 0.88,
        "min_matches": 2,
    },
    {
        "type": "renewal",
        "title": "Automatic renewal",
        "patterns": [r"\brenew\w*\b|\bauto(?:matic|matically)? renewal\b", r"\bnotice\b"],
        "base_confidence": 0.87,
        "min_matches": 2,
    },
    {
        "type": "liability_cap",
        "title": "Liability cap",
        "patterns": [r"\bliabil\w*\b", r"\bcap(?:ped)?\b|\blimited to\b"],
        "base_confidence": 0.9,
        "min_matches": 1,
    },
    {
        "type": "confidentiality",
        "title": "Confidentiality obligations",
        "patterns": [r"\bconfidential", r"\bnon-disclosure\b|\bdisclos"],
        "base_confidence": 0.84,
        "min_matches": 1,
    },
    {
        "type": "subprocessors",
        "title": "Subprocessor usage",
        "patterns": [r"\bsubprocessor", r"\bprocessor\b"],
        "base_confidence": 0.9,
        "min_matches": 1,
    },
    {
        "type": "data_processing",
        "title": "Data processing",
        "patterns": [r"\bpersonal data\b|\bcustomer data\b", r"\bprocess"],
        "base_confidence": 0.85,
        "min_matches": 2,
    },
    {
        "type": "payment",
        "title": "Fees and payment",
        "patterns": [r"\bfee(?:s)?\b", r"\bpayment\b|\binvoice\b"],
        "base_confidence": 0.82,
        "min_matches": 2,
    },
    {
        "type": "governing_law",
        "title": "Governing law and venue",
        "patterns": [r"\bgoverning law\b|\blaws of\b", r"\bjurisdiction\b|\bvenue\b"],
        "base_confidence": 0.83,
        "min_matches": 1,
    },
]


def split_sentences(text: str) -> List[str]:
    normalized = re.sub(r"\s+", " ", text.strip())
    if not normalized:
        return []
    parts = re.split(r"(?<=[.!?])\s+", normalized)
    return [part.strip() for part in parts if part.strip()]


def sentence_matches(sentence: str, patterns: List[str]) -> int:
    matches = 0
    for pattern in patterns:
        if re.search(pattern, sentence, flags=re.IGNORECASE):
            matches += 1
    return matches


def extract_clauses(text: str) -> List[Dict[str, object]]:
    clauses: List[Dict[str, object]] = []
    seen = set()

    for sentence in split_sentences(text):
        for spec in CLAUSE_PATTERNS:
            score = sentence_matches(sentence, spec["patterns"])
            if score < spec["min_matches"]:
                continue

            key = (spec["type"], sentence)
            if key in seen:
                continue

            confidence = min(spec["base_confidence"] + (0.05 * (score - 1)), 0.99)
            clauses.append(
                {
                    "type": spec["type"],
                    "title": spec["title"],
                    "text": sentence,
                    "confidence": round(confidence, 2),
                }
            )
            seen.add(key)

    return clauses


def main() -> int:
    raw = sys.stdin.read()
    try:
        payload = json.loads(raw or "{}")
    except json.JSONDecodeError as exc:
        json.dump({"error": f"Invalid JSON input: {exc.msg}"}, sys.stdout)
        sys.stdout.write("\n")
        return 1

    text = payload.get("text")
    if not isinstance(text, str) or not text.strip():
        json.dump({"error": "Expected a non-empty 'text' field."}, sys.stdout)
        sys.stdout.write("\n")
        return 1

    response = {
        "clauses": extract_clauses(text),
        "tool_version": TOOL_VERSION,
    }
    json.dump(response, sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
