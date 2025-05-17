from typing import Any, List
from uuid import UUID
from tortoise.functions import Count
from backend.api.src.db.models import Room, RoomMember, User


async def get_rooms() -> List[Any]:
    rooms = (
        await Room.annotate(member_count=Count("members"))
        .prefetch_related("members__user")
        .order_by("created_at")
        .all()
    )

    result = []
    for room in rooms:
        members = sorted(room.members, key=lambda m: m.joined_at)  # type: ignore
        first_member = members[0] if members else None

        result.append(
            {
                "uuid": room.id,
                "name": room.name,
                "is_difficult": room.is_difficult,
                "member_count": room.member_count,  # type: ignore
                "host_avatar": first_member.user.avatar_url if first_member else None,
                "host_username": first_member.user.username if first_member else None,
            }
        )

    return result


async def create_room(uuid: UUID, name: str, is_difficult: bool) -> str:
    room = await Room.create(name=name, is_difficult=is_difficult)
    user = await User.get(id=uuid)
    _ = await RoomMember.create(room=room, user=user)

    return str(room.id)
