from logging.config import fileConfig
from pathlib import Path

from alembic import context
from backend.db import models  # noqa: F401
from backend.db.base import Base
from dotenv import dotenv_values
from sqlalchemy import engine_from_config, pool

config = context.config

x_args = context.get_x_argument(as_dictionary=True)
env_file = x_args.get("env")
if not env_file:
    raise RuntimeError(
        "Missing Alembic env file. Run with: alembic -x env=.env upgrade head"
    )

env_path = Path(env_file).expanduser().resolve()
if not env_path.is_file():
    raise RuntimeError(f"Env file not found: {env_path}")

env = dotenv_values(env_path)
database_url = env.get("AGENTHUB_DATABASE_URL")
if not database_url:
    raise RuntimeError(f"AGENTHUB_DATABASE_URL is not set in env file: {env_path}")

config.set_main_option("sqlalchemy.url", database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
