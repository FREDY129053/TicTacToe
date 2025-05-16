from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class UserEnter(BaseModel):
    username: str
    password: str


class FullUser(UserEnter):
    id: UUID
    avatar_url: str
    created_at: datetime
