from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from backend.api.src.enums import StatType


class UserEnter(BaseModel):
    username: str
    password: str


class FullUser(UserEnter):
    id: UUID
    avatar_url: str
    created_at: datetime


class UpdateStats(BaseModel):
    user_uuid: UUID
    stat_type: StatType
