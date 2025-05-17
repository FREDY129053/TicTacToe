from fastapi import APIRouter
from .user import user_router
from .room import room_router

router = APIRouter(prefix="/api")

router.include_router(user_router)
router.include_router(room_router)
