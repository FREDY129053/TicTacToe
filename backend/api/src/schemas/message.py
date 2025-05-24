from typing import Any

from pydantic import BaseModel


class ServiceMessage(BaseModel):
    is_error: bool = False
    message: Any
    status_code: int
