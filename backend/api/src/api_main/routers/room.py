from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import backend.api.src.services.room as RoomService
from backend.api.src.schemas import CreateRoom

room_router = APIRouter(prefix="/rooms", tags=["Rooms"])


@room_router.get("")
async def get_all_rooms():
    message = await RoomService.get_rooms_data()

    return message.message


@room_router.post("")
async def create_room(room: CreateRoom):
    message = await RoomService.create_room(room_data=room)

    if message.is_error:
        raise HTTPException(status_code=message.status_code, detail=message.message)

    return JSONResponse(
        content={"uuid": message.message}, status_code=message.status_code
    )
