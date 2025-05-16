from typing import Optional
from uuid import UUID

from tortoise.exceptions import DoesNotExist, OperationalError

from backend.api.src.db.models import User, UserStats


async def get_user(uuid: UUID) -> Optional[User]:
    try:
        user = await User.get(id=uuid)
        return user
    except DoesNotExist:
        return None


async def get_user_by_username(username: str) -> Optional[User]:
    try:
        user = await User.get(username=username)
        return user
    except DoesNotExist:
        return None


async def create_user(username: str, password: str, avatar_url: str) -> UUID:
    new_user = await User.create(
        username=username, password=password, avatar_url=avatar_url
    )
    _ = await UserStats.create(user=new_user)

    return new_user.id


async def delete_user(uuid: UUID) -> bool:
    user = await User.get_or_none(id=uuid)
    if not user:
        return False

    try:
        _ = await user.delete()
        return True
    except OperationalError:
        return False
