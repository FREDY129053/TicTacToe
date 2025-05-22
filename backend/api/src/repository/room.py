from datetime import datetime, timezone
from typing import Any, List
from uuid import UUID
from tortoise.functions import Count
from backend.api.src.db.models import Room, RoomMember, User, Game, GameResult


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


async def is_user_in_room(uuid: UUID, room_uuid: UUID) -> bool:
    user = await User.get(id=uuid)
    room = await Room.get(id=room_uuid)
    is_in_room = await RoomMember.get_or_none(user=user, room=room)

    if is_in_room is None:
        return False
    return True


async def add_user_at_room(uuid: UUID, room_uuid: UUID) -> RoomMember:
    user = await User.get(id=uuid)
    room = await Room.get(id=room_uuid)
    room_member = await RoomMember.create(user=user, room=room)

    return room_member


async def delete_user_from_room(uuid: UUID, room_uuid: UUID) -> bool:
    user = await User.get(id=uuid)
    room = await Room.get(id=room_uuid)
    room_member = await RoomMember.get(user=user, room=room)
    _ = await room_member.delete()

    return True


async def get_all_rooms_and_members() -> List[RoomMember]:
    return await RoomMember.all()


async def get_all_room_members(uuid: UUID, exclude_user: str):
    room = await Room.get(id=uuid)
    members = (
        await RoomMember.filter(room=room)
        .exclude(user_id=exclude_user)
        .prefetch_related("user")
    )
    if not members:
        return None
    opponent = members[0]
    return {
        "avatar_url": opponent.user.avatar_url,
        "username": opponent.user.username,
    }


async def create_game_record(room_id: UUID, game_id: UUID, is_hard: bool):
    room = await Room.get(id=room_id)

    return await Game.create(id=game_id, room=room, is_difficult=is_hard)


async def update_game(uuid: UUID):
    game = await Game.get(id=uuid)
    game.ended_at = datetime.now(timezone.utc)

    return await game.save()


async def write_result(
    game_uuid: UUID, user_uuid: UUID, opponent_uuid: UUID, result: str
):
    return await GameResult.create(
        game_id=game_uuid, user_id=user_uuid, opponent_id=opponent_uuid, result=result
    )


async def delete_game(uuid: UUID):
    game = await Game.get(id=uuid)

    return await game.delete()
