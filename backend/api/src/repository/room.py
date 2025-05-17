from typing import Any, List
from tortoise.functions import Count
from backend.api.src.db.models import Room


async def get_rooms() -> List[Any]:
    rooms = (
        await Room.annotate(member_count=Count("members"))
        .prefetch_related("members__user")
        .order_by("created_at")
        .all()
    )

    result = []
    for room in rooms:
        members = sorted(rooms.members, key=lambda m: m.joined_at)  # type: ignore
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
