import asyncio
from typing import Dict, List, Set, Tuple
from uuid import uuid4

import httpx
from fastapi import WebSocket

API_BASE_URL = "http://localhost:8080/api/rooms"


class ConnectionManager:
    """TODO: docstring нахерачить"""

    def __init__(self):
        self.clientConnections: Dict[str, WebSocket] = {}
        self.ready_votes: Dict[str, Set[str]] = {}
        self.opponents: Dict[str, str] = {}
        self.rooms: Dict[str, List[str]] = {}
        self.is_difficult: bool = False
        self._room_and_game_data: Dict[str, Dict[str, bool]] = {}

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

            opponent_id = self.opponents.get(user_id)
            if opponent_id and opponent_id in self.clientConnections:
                asyncio.create_task(
                    self.clientConnections[opponent_id].send_json(
                        {
                            "method": "left",
                            "message": "Поиск соперника...",
                        }
                    )
                )

            self.opponents.pop(user_id, None)
            self.opponents.pop(opponent_id, None)  # type: ignore
            for room_id, room in self.rooms.items():
                if user_id in room:
                    room.remove(user_id)
                    asyncio.create_task(self._remove_user_from_room(user_id, room_id))

                    game_data = self._room_and_game_data[room_id]
                    if next(iter(game_data.values())):
                        asyncio.create_task(
                            self._delete_game(next(iter(game_data.keys())))
                        )

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
                "method": "start",
            },
        )
        await self._send(
            player_2,
            {
                "method": "start",
            },
        )

    async def _send(self, user_id: str, message: Dict[str, str | int]):
        ws = self.clientConnections.get(user_id)
        if ws:
            await ws.send_json(message)

    # HTTP запросы
    # Заросы по комнате
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
                response.raise_for_status()
        except Exception as e:
            print(f"[ERROR] Не удалось удалить пользователя из комнаты: {e}")

    async def _update_user_stats(self, user_id: str, type: str):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.patch(
                    "http://localhost:8080/api/users/update_stats",
                    json={"user_uuid": user_id, "stat_type": type},
                )
                response.raise_for_status()
        except Exception as e:
            print(f"[ERROR] Не удалось обновить ститистику пользователя: {e}")

    # HTTP запросы
    # Запросы по самим играм
    async def _add_game(self, room_id: str, game_id: str, is_hard: bool):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{API_BASE_URL}/{room_id}/start_game?generated_id={game_id}&is_hard={is_hard}",
                )
                response.raise_for_status()
        except Exception as e:
            print(f"[ERROR] Не удалось создать игру: {e}")

    async def _write_game_result(
        self, game_id: str, user_id: str, opponent_id: str, result: str
    ):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{API_BASE_URL}/games/{game_id}/result",
                    json={
                        "user_uuid": user_id,
                        "opponent_uuid": opponent_id,
                        "result": result,
                    },
                )
                response.raise_for_status()
        except Exception as e:
            print(f"[ERROR] Не удалось добавить результат: {e}")

    async def _update_game(self, game_id: str):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.patch(
                    f"{API_BASE_URL}/games/{game_id}",
                )
                response.raise_for_status()
        except Exception as e:
            print(f"[ERROR] Не удалось обновить игру: {e}")

    async def _delete_game(self, game_id: str):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    f"{API_BASE_URL}/games/{game_id}",
                )
                response.raise_for_status()
        except Exception as e:
            print(f"[ERROR] Не удалось удалить игру: {e}")

    # Ходы
    async def handle_game_start(self, user_id: str, room_id: str):
        if room_id not in self.ready_votes:
            self.ready_votes[room_id] = set()

        self.ready_votes[room_id].add(user_id)

        votes_count = len(self.ready_votes[room_id])

        player_2 = self.rooms[room_id][-1]
        player_1 = self.rooms[room_id][-2]

        await self._send(player_1, {"method": "ready_vote", "votes": votes_count})
        await self._send(player_2, {"method": "ready_vote", "votes": votes_count})

        if votes_count >= 2:
            game_uuid = str(uuid4())
            self._room_and_game_data[room_id] = {game_uuid: True}
            self.ready_votes[room_id] = set()
            empty_field = [""] * 9

            await self._send(
                player_1,
                {
                    "method": "game_start",
                    "field": empty_field,  # type: ignore
                    "turn": "X",
                    "symbol": "X",
                },
            )
            await self._send(
                player_2,
                {
                    "method": "game_start",
                    "field": empty_field,  # type: ignore
                    "turn": "X",
                    "symbol": "O",
                },
            )

            await self._add_game(
                room_id=room_id, game_id=game_uuid, is_hard=self.is_difficult
            )

    async def handle_move(self, user_id: str, data: Dict[str, str | int], room_id: str):
        opponent_id = self.opponents.get(user_id)
        if not opponent_id:
            return

        field = data.get("field", [])
        symbol = data.get("symbol")
        game_data = self._room_and_game_data[room_id]
        game_id = next(iter(game_data.keys()))

        is_winner, comb = self._check_winner(field)  # type: ignore
        if is_winner:
            result_message = {
                "method": "result",
                "field": field,
                "symbol": symbol,
                "combination": comb,
            }
            self._room_and_game_data[room_id][game_id] = False
            await self._send(user_id, result_message)
            await self._send(opponent_id, result_message)
            await self._update_user_stats(user_id, "wins")
            await self._update_user_stats(opponent_id, "losses")

            await self._update_game(game_id)
            await self._write_game_result(
                game_id=game_id, user_id=user_id, opponent_id=opponent_id, result="win"
            )
            await self._write_game_result(
                game_id=game_id, user_id=opponent_id, opponent_id=user_id, result="lose"
            )

            return

        if self._check_draw(field):  # type: ignore
            draw_message = {
                "method": "result",
                "message": "Ничья",
                "field": field,
                "symbol": None,
                "combination": [],
            }
            self._room_and_game_data[room_id][game_id] = False
            await self._send(user_id, draw_message)
            await self._send(opponent_id, draw_message)
            await self._update_user_stats(user_id, "draws")
            await self._update_user_stats(opponent_id, "draws")

            await self._update_game(game_id)
            await self._write_game_result(
                game_id=game_id, user_id=user_id, opponent_id=opponent_id, result="draw"
            )
            await self._write_game_result(
                game_id=game_id, user_id=opponent_id, opponent_id=user_id, result="draw"
            )

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

    def _check_winner(self, field: List[str]) -> Tuple[bool, List[int]]:
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
                return True, comb

        return False, []
