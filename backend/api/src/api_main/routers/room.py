from fastapi import APIRouter

import backend.api.src.services.room as RoomService

room_router = APIRouter(prefix="/rooms", tags=["Rooms"])


@room_router.get("")
async def get_all_rooms():
    message = await RoomService.get_rooms_data()

    return message.message
