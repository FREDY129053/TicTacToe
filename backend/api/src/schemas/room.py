from pydantic import BaseModel
from uuid import UUID


class CreateRoom(BaseModel):
    user_uuid: UUID
    name: str
    is_difficult: bool
