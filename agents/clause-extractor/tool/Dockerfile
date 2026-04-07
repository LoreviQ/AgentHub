FROM python:3.12-slim

WORKDIR /app

COPY main.py /app/main.py

RUN useradd --create-home --shell /usr/sbin/nologin appuser

USER appuser

ENTRYPOINT ["python3", "/app/main.py"]
