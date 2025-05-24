from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from backend.api.src.enums import StatType


class UserEnter(BaseModel):
    """Данные для входа/регистрации пользователя"""

    username: str
    password: str


class FullUser(UserEnter):
    """Данные о пользователе"""

    id: UUID
    avatar_url: str
    created_at: datetime


class UpdateStats(BaseModel):
    """Данные для обновления статистики пользователя"""

    user_uuid: UUID
    stat_type: StatType
