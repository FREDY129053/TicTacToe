import backend.api.src.repository.room as RoomRepo
from backend.api.src.schemas import ServiceMessage


async def get_rooms_data() -> ServiceMessage:
    result = await RoomRepo.get_rooms()

    return ServiceMessage(message=result, status_code=200)
