from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
import backend.api.src.services.room as RoomService
from backend.api.src.schemas import CreateRoom, AddMember, WriteResult
from uuid import UUID

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


@room_router.get("/is_in_room")
async def check_user_in_room(user_uuid: UUID, room_uuid: UUID):
    message = await RoomService.is_user_in_room(user_uuid=user_uuid, room_uuid=room_uuid)

    return JSONResponse(
        content={"result": message.message}, status_code=message.status_code
    )


@room_router.get("/all_members")
async def get_all_rooms_and_members():
    message = await RoomService.get_all_members()

    return message.message


@room_router.get("/{uuid}/opponent")
async def get_all_members_in_room(request: Request, uuid: UUID):
    message = await RoomService.get_all_members_at_room(
        uuid, request.cookies.get("user", "")
    )

    return message.message


@room_router.post("/add_member")
async def insert_member_to_room(data: AddMember):
    message = await RoomService.insert_user_at_room(
        user_uuid=data.user_uuid, room_uuid=data.room_uuid
    )

    return JSONResponse(
        content={"message": message.message}, status_code=message.status_code
    )


@room_router.delete("/delete_member")
async def delete_member_from_room(user_uuid: UUID, room_uuid: UUID):
    message = await RoomService.delete_user_from_room(
        user_uuid=user_uuid, room_uuid=room_uuid
    )

    return JSONResponse(
        content={"message": message.message}, status_code=message.status_code
    )


@room_router.post("/{uuid}/start_game")
async def game_create_record(uuid: UUID, generated_id: UUID, is_hard: bool):
    message = await RoomService.create_game(
        room_id=uuid, game_id=generated_id, is_hard=is_hard
    )

    return JSONResponse(
        content={"message": message.message}, status_code=message.status_code
    )


@room_router.patch("/games/{uuid}")
async def update_game_record(uuid: UUID):
    message = await RoomService.update_game(uuid=uuid)

    return JSONResponse(
        content={"message": message.message}, status_code=message.status_code
    )


@room_router.post("/games/{uuid}/result")
async def write_game_result(uuid: UUID, result_data: WriteResult):
    message = await RoomService.write_game_result(game_uuid=uuid, game_data=result_data)

    return JSONResponse(
        content={"message": message.message}, status_code=message.status_code
    )


@room_router.get("/games")
async def get_games():
    from backend.api.src.db.models import Game

    return await Game.all()


@room_router.get("/results")
async def get_results():
    from backend.api.src.db.models import GameResult

    return await GameResult.all()


@room_router.delete("/games/{uuid}")
async def delete_game(uuid: UUID):
    message = await RoomService.delete_game(uuid)

    return JSONResponse(
        content={"message": message.message}, status_code=message.status_code
    )
