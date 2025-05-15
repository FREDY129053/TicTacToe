from fastapi import FastAPI
from tortoise import Tortoise
from tortoise.contrib.fastapi import register_tortoise

TORTOISE_ORM = {
    "connections": {"default": "postgres://postgres:12345@localhost:5433/tic_tac_toe_db"},
    "apps": {
        "models": {
            "models": ["api.src.db.models", "aerich.models"],
            "default_connection": "default",
        }
    },
}


async def init_db_tortoise(_app: FastAPI):
    await Tortoise.init(config=TORTOISE_ORM)

    register_tortoise(
        app=_app,
        config=TORTOISE_ORM,
    )
