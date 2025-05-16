from pydantic import BaseModel


class ServiceMessage(BaseModel):
    is_error: bool = False
    message: str
    status_code: int
