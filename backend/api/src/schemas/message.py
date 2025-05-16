from pydantic import BaseModel
from typing import List, Any, Union


class ServiceMessage(BaseModel):
    is_error: bool = False
    message: Union[str, List[Any]]
    status_code: int
