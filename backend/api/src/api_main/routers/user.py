from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import backend.api.src.services.user as UserService
from backend.api.src.schemas import UserEnter

user_router = APIRouter(prefix="/users", tags=["Users"])


@user_router.post("/login")
async def login_user(user_data: UserEnter):
    message = await UserService.user_enter(
        username=user_data.username, password=user_data.password
    )
    if message.is_error:
        raise HTTPException(status_code=message.status_code, detail=message.message)

    return JSONResponse(
        content={"message": message.message}, status_code=message.status_code
    )
