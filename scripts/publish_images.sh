#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-${ROOT_DIR}/.env.prod}"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Expected env file at ${ENV_FILE}" >&2
  exit 1
fi

# shellcheck disable=SC1090
source "${ENV_FILE}"

: "${AGENTHUB_BACKEND_IMAGE:?Set AGENTHUB_BACKEND_IMAGE in ${ENV_FILE}}"
: "${AGENTHUB_FRONTEND_IMAGE:?Set AGENTHUB_FRONTEND_IMAGE in ${ENV_FILE}}"
: "${CLAUSE_TOOL_IMAGE:?Set CLAUSE_TOOL_IMAGE in ${ENV_FILE}}"

echo "Building backend and frontend images with ${ENV_FILE}"
docker compose --env-file "${ENV_FILE}" -f "${ROOT_DIR}/docker-compose.build.yml" build backend frontend

echo "Pushing ${AGENTHUB_BACKEND_IMAGE}"
docker push "${AGENTHUB_BACKEND_IMAGE}"

echo "Pushing ${AGENTHUB_FRONTEND_IMAGE}"
docker push "${AGENTHUB_FRONTEND_IMAGE}"

echo "Building ${CLAUSE_TOOL_IMAGE}"
docker build -t "${CLAUSE_TOOL_IMAGE}" "${ROOT_DIR}/agents/clause-extractor/tool"

echo "Pushing ${CLAUSE_TOOL_IMAGE}"
docker push "${CLAUSE_TOOL_IMAGE}"

echo "Published backend, frontend, and clause tool images."
