from pydantic import BaseModel
from typing import Any


class ServiceMessage(BaseModel):
    is_error: bool = False
    message: Any
    status_code: int
