import backend.api.src.repository.room as RoomRepo
from backend.api.src.schemas import CreateRoom, ServiceMessage


async def get_rooms_data() -> ServiceMessage:
    result = await RoomRepo.get_rooms()

    return ServiceMessage(message=result, status_code=200)


async def create_room(room_data: CreateRoom) -> ServiceMessage:
    created = await RoomRepo.create_room(
        uuid=room_data.user_uuid, name=room_data.name, is_difficult=room_data.is_difficult
    )

    return ServiceMessage(message=created, status_code=201)
