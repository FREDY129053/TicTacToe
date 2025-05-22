from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
from .socket_manager import ConnectionManager

websockets_router = APIRouter(prefix="/ws/game")

manager = ConnectionManager()


@websockets_router.websocket("/{room_id}")
async def main_game(websocket: WebSocket, room_id: str, user_id: str, is_hard: bool):
    await manager.connect(
        websocket=websocket, room_id=room_id, user_id=user_id, difficult=is_hard
    )

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            match message.get("method"):
                case "move":
                    await manager.handle_move(
                        user_id=user_id, data=message, room_id=room_id
                    )
                case "game_start":
                    await manager.handle_game_start(user_id=user_id, room_id=room_id)
    except WebSocketDisconnect:
        await manager.disconnect(user_id=user_id)
