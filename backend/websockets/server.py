# Здесь собирается приложение(app) из роутеров, инициализации БД и т.д.
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.websockets.router import websockets_router


def create_app() -> FastAPI:
    """Сборка итогового приложения

    Returns:
        FastAPI: готовое приложение с роутерами, CORS и т.д.
    """
    _app = FastAPI(
        title="Tic-Tac-Toe Websockets API",
        docs_url="/docs",
    )

    _app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    _app.include_router(router=websockets_router)

    return _app


app = create_app()
