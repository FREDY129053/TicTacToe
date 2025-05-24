from typing import Any

from pydantic import BaseModel


class ServiceMessage(BaseModel):
    """Формирование ответа от сервисов"""

    is_error: bool = False
    message: Any
    status_code: int
