import asyncio
import time
from typing import Dict, List, Set

import httpx
from fastapi import WebSocket

API_BASE_URL = "http://localhost:8080/api/rooms"


class ConnectionManager:
    """TODO: docstring нахерачить"""

    def __init__(self):
        self.clientConnections: Dict[str, WebSocket] = {}
        self.restart_votes: Dict[str, Set[str]] = {}
        self.opponents: Dict[str, str] = {}
        self.rooms: Dict[str, List[str]] = {}
        self.last_disconnect_time: Dict[str, float] = {}
        self.is_difficult: bool = False

    async def connect(
        self, websocket: WebSocket, room_id: str, user_id: str, difficult: bool
    ):
        await websocket.accept()
        self.clientConnections[user_id] = websocket
        self.is_difficult = difficult

        if not await self._is_user_in_room(user_id, room_id):
            await self._add_user_to_room(user_id, room_id)

        await self._match_clients(user_id, room_id)

    async def disconnect(self, user_id: str):
        if user_id in self.clientConnections:
            del self.clientConnections[user_id]
            self.last_disconnect_time[user_id] = time.time()

            opponent_id = self.opponents.get(user_id)
            if opponent_id and opponent_id in self.clientConnections:
                asyncio.create_task(
                    self.clientConnections[opponent_id].send_json(
                        {
                            "method": "left",
                            "message": "Противник съебал",
                        }
                    )
                )

            self.opponents.pop(user_id, None)
            self.opponents.pop(opponent_id, None)  # type: ignore
            print(f"{user_id}\n{self.rooms.items()}")
            for room_id, room in self.rooms.items():
                if user_id in room:
                    room.remove(user_id)
                    print(f"Need delete\n{room_id} | {user_id}")
                    asyncio.create_task(self._remove_user_from_room(user_id, room_id))

    async def _match_clients(self, user_id: str, room_id: str):
        if room_id not in self.rooms:
            self.rooms[room_id] = []
        self.rooms[room_id].append(user_id)

        if len(self.rooms[room_id]) < 2:
            return

        player_2 = self.rooms[room_id][-1]
        player_1 = self.rooms[room_id][-2]

        self.opponents[player_1] = player_2
        self.opponents[player_2] = player_1

        await self._send(
            player_1,
            {
                "method": "join",
                "symbol": "X",
                "turn": "X",
            },
        )
        await self._send(
            player_2,
            {
                "method": "join",
                "symbol": "O",
                "turn": "X",
            },
        )

    async def _send(self, user_id: str, message: Dict[str, str | int]):
        ws = self.clientConnections.get(user_id)
        if ws:
            await ws.send_json(message)

    async def _is_user_in_room(self, user_id: str, room_id: str) -> bool:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{API_BASE_URL}/is_in_room",
                    params={"user_uuid": user_id, "room_uuid": room_id},
                )
                response.raise_for_status()
                return response.json()["result"] is True
        except Exception as e:
            print(f"[ERROR] Проверка is_in_room не удалась: {e}")
            return False

    async def _add_user_to_room(self, user_id: str, room_id: str):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{API_BASE_URL}/add_member",
                    json={"user_uuid": user_id, "room_uuid": room_id},
                )
                response.raise_for_status()
        except Exception as e:
            print(f"[ERROR] Не удалось добавить пользователя в комнату: {e}")

    async def _remove_user_from_room(self, user_id: str, room_id: str):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    f"{API_BASE_URL}/delete_member",
                    params={"user_uuid": user_id, "room_uuid": room_id},
                )
                print(f"RESP = {response.status_code}")
                response.raise_for_status()
        except Exception as e:
            print(f"[ERROR] Не удалось удалить пользователя из комнаты: {e}")

    async def handle_restart(self, user_id: str, room_id: str):
        if room_id not in self.restart_votes:
            self.restart_votes[room_id] = set()

        self.restart_votes[room_id].add(user_id)

        votes_count = len(self.restart_votes[room_id])

        opponent = self.opponents[user_id]
        await self._send(user_id, {"method": "restart_vote", "votes": votes_count})
        await self._send(opponent, {"method": "restart_vote", "votes": votes_count})

        if votes_count >= 2:
            self.restart_votes[room_id] = set()
            empty_field = [""] * 9

            await self._send(
                user_id,
                {"method": "restart", "field": empty_field, "message": "Game restarted!"},  # type: ignore
            )
            await self._send(
                opponent,
                {"method": "restart", "field": empty_field, "message": "Game restarted!"},  # type: ignore
            )

    async def handle_move(self, user_id: str, data: Dict[str, str | int]):
        opponent_id = self.opponents.get(user_id)
        if not opponent_id:
            return

        field = data.get("field", [])
        symbol = data.get("symbol")

        if self._check_winner(field):  # type: ignore
            result_message = {
                "method": "result",
                "message": f"{symbol} победил!",
                "field": field,
            }
            await self._send(user_id, result_message)
            await self._send(opponent_id, result_message)

            return

        if self._check_draw(field):  # type: ignore
            draw_message = {
                "method": "result",
                "message": "Ничья",
                "field": field,
            }
            await self._send(user_id, draw_message)
            await self._send(opponent_id, draw_message)

            return

        update_message = {
            "method": "update",
            "turn": "O" if symbol == "X" else "X",
            "field": field,
        }
        await self._send(user_id, update_message)
        await self._send(opponent_id, update_message)

        return

    def _check_draw(self, field: List[str]) -> bool:
        return all(cell != "" for cell in field)

    def _check_winner(self, field: List[str]) -> bool:
        winning_combs = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ]

        for comb in winning_combs:
            a, b, c = comb
            if field[a] != "" and field[a] == field[b] == field[c]:
                return True

        return False
