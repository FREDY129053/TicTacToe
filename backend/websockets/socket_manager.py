import asyncio
from typing import Dict, List, Set
from uuid import uuid4

from fastapi import WebSocket

from backend.websockets.helpers import (
    add_game,
    add_user_to_room,
    check_draw,
    check_winner,
    delete_game,
    is_user_in_room,
    remove_user_from_room,
    update_game,
    update_user_stats,
    write_game_result,
)

API_BASE_URL = "http://localhost:8080/api/rooms"


class ConnectionManager:
    """Менеджер действий для Websocket"""

    def __init__(self):
        # Текущие подключения для каждого игрока
        self.clientConnections: Dict[str, WebSocket] = {}
        # Проголосовавшие "за" в каждой комнате
        self.ready_votes: Dict[str, Set[str]] = {}
        # Оппонент для каждого игрока
        self.opponents: Dict[str, str] = {}
        # Информация о комнате и игроках в ней
        self.rooms: Dict[str, List[str]] = {}
        # Сложность комнаты (да/нет)
        self.is_difficult: bool = False
        # Хранение игры для комнаты со статусом активности
        self._room_and_game_data: Dict[str, Dict[str, bool]] = {}

    async def connect(
        self, websocket: WebSocket, room_id: str, user_id: str, difficult: bool
    ):
        """Подключение пользователя к комнате

        Args:
            websocket (WebSocket): подключение
            room_id (str): идентификатор комнаты
            user_id (str): идентификатор пользователя
            difficult (bool): сложность игры (да/нет)
        """
        await websocket.accept()
        # Сохраняем принятое подключение для отправки сообщений
        self.clientConnections[user_id] = websocket
        self.is_difficult = difficult

        # Если пользователя нет в комнате, то записываем его
        if not await is_user_in_room(user_id, room_id):
            await add_user_to_room(user_id, room_id)

        # Подбираем оппонента
        await self._match_clients(user_id, room_id)

    async def disconnect(self, user_id: str):
        """Отключение игрока

        Args:
            user_id (str): идентификатор игрока
        """
        if user_id in self.clientConnections:
            del self.clientConnections[user_id]

            # Отправка сообщения оппоненту, что пользователь вышел
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
            # Удаляем данные об отключенном пользователе из комнаты
            for room_id, room in self.rooms.items():
                if user_id in room:
                    room.remove(user_id)
                    asyncio.create_task(remove_user_from_room(user_id, room_id))

                    # Удаление данных об игре при отключении
                    game_data = self._room_and_game_data[room_id]
                    if next(iter(game_data.values())):
                        asyncio.create_task(delete_game(next(iter(game_data.keys()))))

    async def _match_clients(self, user_id: str, room_id: str):
        """Подбор игроков друг другу в одной комнате

        Args:
            user_id (str): идентификатор пользователя
            room_id (str): идентификатор комнаты
        """
        # Создаем данные об игроках в комнате, если ее не было
        if room_id not in self.rooms:
            self.rooms[room_id] = []
        self.rooms[room_id].append(user_id)

        # Если игроков не достаточно, то ничего не делаем
        if len(self.rooms[room_id]) < 2:
            return

        # Задаем оппонентов в комнате
        player_2 = self.rooms[room_id][-1]
        player_1 = self.rooms[room_id][-2]

        self.opponents[player_1] = player_2
        self.opponents[player_2] = player_1

        # Шлем сообщения игрокам в комнате
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
        """Отправка сообщений пользователю

        Args:
            user_id (str): идентификатор пользователя
            message (Dict[str, str  |  int]): сообщение для сериализации в JSON
        """
        ws = self.clientConnections.get(user_id)
        if ws:
            await ws.send_json(message)

    # Ходы
    async def handle_game_start(self, user_id: str, room_id: str):
        """Активация игры путем голосования

        Args:
            user_id (str): идентификатор пользователя
            room_id (str): идентификатор комнаты
        """
        if room_id not in self.ready_votes:
            self.ready_votes[room_id] = set()

        self.ready_votes[room_id].add(user_id)

        votes_count = len(self.ready_votes[room_id])

        player_2 = self.rooms[room_id][-1]
        player_1 = self.rooms[room_id][-2]

        await self._send(player_1, {"method": "ready_vote", "votes": votes_count})
        await self._send(player_2, {"method": "ready_vote", "votes": votes_count})

        # Если готовы все, то начинаем игру
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

            await add_game(room_id=room_id, game_id=game_uuid, is_hard=self.is_difficult)

    async def handle_move(self, user_id: str, data: Dict[str, str | int], room_id: str):
        """Ходы во время игры

        Args:
            user_id (str): идентификатор пользователя
            data (Dict[str, str  |  int]): данные о ходе игрока
            room_id (str): идентификатор комнаты
        """
        opponent_id = self.opponents.get(user_id)
        if not opponent_id:
            return

        # Получаем нужные данные
        field = data.get("field", [])
        symbol = data.get("symbol")
        game_data = self._room_and_game_data[room_id]
        game_id = next(iter(game_data.keys()))

        is_winner, comb = check_winner(field)  # type: ignore
        # Если победа, то выдаем результат
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
            await update_user_stats(user_id, "wins")
            await update_user_stats(opponent_id, "losses")

            await update_game(game_id)
            await write_game_result(
                game_id=game_id, user_id=user_id, opponent_id=opponent_id, result="win"
            )
            await write_game_result(
                game_id=game_id, user_id=opponent_id, opponent_id=user_id, result="lose"
            )

            return

        if check_draw(field):  # type: ignore
            # Если ничья, то выдаем результат
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
            await update_user_stats(user_id, "draws")
            await update_user_stats(opponent_id, "draws")

            await update_game(game_id)
            await write_game_result(
                game_id=game_id, user_id=user_id, opponent_id=opponent_id, result="draw"
            )
            await write_game_result(
                game_id=game_id, user_id=opponent_id, opponent_id=user_id, result="draw"
            )

            return

        # Если игра в процессе, то продолжаем играть
        update_message = {
            "method": "update",
            "turn": "O" if symbol == "X" else "X",
            "field": field,
        }
        await self._send(user_id, update_message)
        await self._send(opponent_id, update_message)

        return
