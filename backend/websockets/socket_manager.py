import asyncio
import time
from typing import Dict, List, Set

import requests
from fastapi import WebSocket


class ConnectionManager:
    """TODO: docstring нахерачить"""

    def __init__(self):
        self.clientConnections: Dict[int, WebSocket] = {}
        self.restart_votes: Dict[int, Set[int]] = {}
        self.opponents: Dict[int, int] = {}
        self.rooms: Dict[int, List[int]] = {}
        self.last_disconnect_time: Dict[int, float] = {}
        self.is_difficult: bool = False

    async def connect(
        self, websocket: WebSocket, room_id: int, user_id: int, difficult: bool
    ):
        await websocket.accept()
        self.clientConnections[user_id] = websocket
        self.is_difficult = difficult
        # Че то срет много и не уменьшает потом кстати
        if user_id not in self.rooms.get(room_id, []):
            last_disconnect = self.last_disconnect_time.get(user_id, 0)
            if time.time() - last_disconnect > 1:
                _ = requests.patch(f"http://localhost:8000/rooms/{room_id}?method=add")
                # _ = requests.patch(f'http://room_api:8000/rooms/{room_id}?method=add')
                print(f"[INFO] New active user {user_id} in room {room_id}")

        await self._match_clients(user_id, room_id)

    def disconnect(self, user_id: int):
        if user_id in self.clientConnections:
            del self.clientConnections[user_id]
            self.last_disconnect_time[user_id] = time.time()

            opponent_id = self.opponents.get(user_id)
            if opponent_id and opponent_id in self.clientConnections:
                message = {
                    "method": "left",
                    "message": "Противник съебал",
                }

                try:
                    ws = self.clientConnections[opponent_id]
                    asyncio.create_task(ws.send_json(message))
                except Exception as error:
                    print(f"[WARNING] Error notify opponent: {error}")

            self.opponents.pop(user_id, None)
            self.opponents.pop(opponent_id, None)

            for room_id, room in self.rooms.items():
                if user_id in room:
                    room.remove(user_id)
                    _ = requests.patch(
                        f"http://localhost:8000/rooms/{room_id}?method=min"
                    )  # Передача **имени** контейнера с апи

    async def _match_clients(self, user_id: int, room_id: int):
        if room_id not in self.rooms:
            self.rooms[room_id] = []
        self.rooms[room_id].append(user_id)

        if len(self.rooms[room_id]) < 2:
            return

        player_2 = self.rooms[room_id].pop()
        player_1 = self.rooms[room_id].pop()

        self.opponents[player_1] = player_2
        self.opponents[player_2] = player_1

        await self._send(
            player_1,
            {
                "method": "join",
                "symbol": "X",
                "turn": "X",
                "roomID": room_id,
                "difficult": self.is_difficult,
            },
        )

        await self._send(
            player_2,
            {
                "method": "join",
                "symbol": "O",
                "turn": "X",
                "roomID": room_id,
                "difficult": self.is_difficult,
            },
        )

    async def _send(self, user_id: int, message: Dict[str, str | int]):
        ws = self.clientConnections.get(user_id)
        if ws:
            await ws.send_json(message)

    async def handle_restart(self, user_id: int, room_id: int):
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
                {"method": "restart", "field": empty_field, "message": "Game restarted!"},
            )
            await self._send(
                opponent,
                {"method": "restart", "field": empty_field, "message": "Game restarted!"},
            )

    async def handle_move(self, user_id: int, data: Dict[str, str | int]):
        opponent_id = self.opponents.get(user_id)
        if not opponent_id:
            return

        field = data.get("field")
        symbol = data.get("symbol")

        if self._check_winner(field):
            result_message = {
                "method": "result",
                "message": f"{symbol} win!",
                "field": field,
            }
            await self._send(user_id, result_message)
            await self._send(opponent_id, result_message)

            return

        if self._check_draw(field):
            draw_message = {
                "method": "result",
                "message": "Draw",
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
