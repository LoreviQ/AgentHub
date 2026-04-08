FROM python:3.14-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV UV_LINK_MODE=copy
ENV UV_PROJECT_ENVIRONMENT=/opt/venv

WORKDIR /app/backend

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

COPY backend/pyproject.toml backend/uv.lock ./
COPY backend/README.md ./README.md
COPY backend/src ./src

RUN uv sync --locked --no-dev --no-editable

FROM python:3.14-slim AS runner

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PATH=/opt/venv/bin:$PATH

WORKDIR /app/backend

COPY --from=builder /opt/venv /opt/venv
COPY --from=docker:28-cli /usr/local/bin/docker /usr/local/bin/docker
COPY backend/alembic.ini ./alembic.ini
COPY backend/alembic ./alembic
COPY scripts /app/scripts

CMD ["backend"]
