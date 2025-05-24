from uuid import UUID

from pydantic import BaseModel

from backend.api.src.enums import Result


class CreateRoom(BaseModel):
    """Создание комнаты"""

    user_uuid: UUID
    name: str
    is_difficult: bool


class AddMember(BaseModel):
    """Добавление участника в комнату"""

    user_uuid: UUID
    room_uuid: UUID


class WriteResult(BaseModel):
    """Данные для записи результата игры"""

    user_uuid: UUID
    opponent_uuid: UUID
    result: Result


class GameResultOut(BaseModel):
    """Результат игры"""

    result: Result
    opponent_avatar: str
    opponent_username: str
    game_duration_seconds: int
