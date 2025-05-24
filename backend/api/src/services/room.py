from uuid import UUID

import backend.api.src.repository.room as RoomRepo
from backend.api.src.helpers import decode_jwt_token
from backend.api.src.schemas import CreateRoom, ServiceMessage, WriteResult


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


async def create_game(room_id: UUID, game_id: UUID, is_hard: bool) -> ServiceMessage:
    _ = await RoomRepo.create_game_record(
        room_id=room_id, game_id=game_id, is_hard=is_hard
    )

    return ServiceMessage(message="game created", status_code=201)


async def update_game(uuid: UUID) -> ServiceMessage:
    await RoomRepo.update_game(uuid)

    return ServiceMessage(message="game updated", status_code=200)


async def write_game_result(game_uuid: UUID, game_data: WriteResult) -> ServiceMessage:
    await RoomRepo.write_result(
        game_uuid=game_uuid,
        user_uuid=game_data.user_uuid,
        opponent_uuid=game_data.opponent_uuid,
        result=game_data.result,
    )

    return ServiceMessage(message="result created", status_code=201)


async def delete_game(uuid: UUID) -> ServiceMessage:
    await RoomRepo.delete_game(uuid)

    return ServiceMessage(message="game deleted", status_code=200)


async def get_all_results(token: str) -> ServiceMessage:
    user_uuid = decode_jwt_token(token)
    results = await RoomRepo.get_all_user_games(user_uuid.get("uuid", ""))

    return ServiceMessage(message=results, status_code=200)
