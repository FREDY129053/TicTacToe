import backend.api.src.repository.room as RoomRepo
from backend.api.src.schemas import CreateRoom, ServiceMessage
from backend.api.src.helpers import decode_jwt_token
from uuid import UUID


async def get_rooms_data() -> ServiceMessage:
    result = await RoomRepo.get_rooms()

    return ServiceMessage(message=result, status_code=200)


async def create_room(room_data: CreateRoom) -> ServiceMessage:
    created = await RoomRepo.create_room(
        uuid=room_data.user_uuid, name=room_data.name, is_difficult=room_data.is_difficult
    )

    return ServiceMessage(message=created, status_code=201)


async def is_user_in_room(user_uuid: UUID, room_uuid: UUID) -> ServiceMessage:
    is_in_room = await RoomRepo.is_user_in_room(uuid=user_uuid, room_uuid=room_uuid)

    return ServiceMessage(message=is_in_room, status_code=200)


async def get_all_members() -> ServiceMessage:
    data = await RoomRepo.get_all_rooms_and_members()

    return ServiceMessage(message=data, status_code=200)


async def get_all_members_at_room(uuid: UUID, token: str) -> ServiceMessage:
    user_uuid = decode_jwt_token(token)
    data = await RoomRepo.get_all_room_members(
        uuid, exclude_user=user_uuid.get("uuid", "")
    )

    return ServiceMessage(message=data, status_code=200)


async def insert_user_at_room(user_uuid: UUID, room_uuid: UUID) -> ServiceMessage:
    _ = await RoomRepo.add_user_at_room(uuid=user_uuid, room_uuid=room_uuid)

    return ServiceMessage(message="added user", status_code=200)


async def delete_user_from_room(user_uuid: UUID, room_uuid: UUID) -> ServiceMessage:
    _ = await RoomRepo.delete_user_from_room(uuid=user_uuid, room_uuid=room_uuid)

    return ServiceMessage(message="deleted user from room", status_code=200)
