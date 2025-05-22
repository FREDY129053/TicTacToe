from pydantic import BaseModel
from uuid import UUID
from datetime import timedelta
from backend.api.src.enums import Result


class CreateRoom(BaseModel):
    user_uuid: UUID
    name: str
    is_difficult: bool


class AddMember(BaseModel):
    user_uuid: UUID
    room_uuid: UUID


class WriteResult(BaseModel):
    user_uuid: UUID
    opponent_uuid: UUID
    result: Result


class GameResultOut(BaseModel):
    result: Result
    opponent_avatar: str
    opponent_username: str
    game_duration_seconds: int
