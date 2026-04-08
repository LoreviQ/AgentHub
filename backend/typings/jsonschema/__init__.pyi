from typing import Any


class ValidationError(Exception):
    message: str


def validate(instance: Any, schema: Any, *args: Any, **kwargs: Any) -> None: ...
