from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

import backend.api.src.services.user as UserService
from backend.api.src.schemas import FullUser, UpdateStats, UserEnter

user_router = APIRouter(prefix="/users", tags=["Users"])


@user_router.post("/login")
async def login_user(user_data: UserEnter):
    """### Вход/регистрация пользователя. Если пользовател есть в базе, то вход, иначе регистрация"""
    message = await UserService.user_enter(
        username=user_data.username, password=user_data.password
    )
    if message.is_error:
        raise HTTPException(status_code=message.status_code, detail=message.message)

    response = JSONResponse(
        content={"token": message.message}, status_code=message.status_code
    )

    response.set_cookie("user", str(message.message), httponly=True)

    return response


@user_router.get("", response_model=List[FullUser])
async def get_all_users():
    """### Получение всех пользователей в базе"""
    message = await UserService.get_users()

    return message.message


@user_router.get("/stats")
async def get_stats(user_uuid: UUID):
    """### Получение статистики игр пользователя"""
    message = await UserService.get_stats(user_uuid)

    return message.message


@user_router.get("/{uuid}", response_model=FullUser)
async def get_user(uuid: UUID):
    """### Получение информации о пользователе"""
    message = await UserService.get_user_by_uuid(uuid=uuid)

    if message.is_error:
        raise HTTPException(status_code=message.status_code, detail=message.message)

    return message.message


@user_router.patch("/update_stats")
async def update_stats(data: UpdateStats):
    """### Обновление статистики пользователя"""
    message = await UserService.update_stats(data)

    return JSONResponse(
        content={"message": message.message}, status_code=message.status_code
    )
