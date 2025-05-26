from typing import List, Tuple

import httpx

API_BASE_URL = "http://main_api:8080/api/rooms"


# Заросы по комнате


async def is_user_in_room(user_id: str, room_id: str) -> bool:
    """Проверка нахождения пользователя в комнате

    Args:
        user_id (str): идентификатор пользователя
        room_id (str): идентификатор комнаты

    Returns:
        bool: есть ли пользователь в комнате (да/нет)
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{API_BASE_URL}/is_in_room",
                params={"user_uuid": user_id, "room_uuid": room_id},
            )
            response.raise_for_status()
            return response.json()["result"] is True
    except Exception as e:
        print(f"\033[031m[ERROR]\033[037m\t  Проверка is_in_room не удалась: {e}")
        return False


async def add_user_to_room(user_id: str, room_id: str):
    """Добавление пользователя в комнату

    Args:
        user_id (str): идентификатор пользователя
        room_id (str): идентификатор комнаты
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_BASE_URL}/add_member",
                json={"user_uuid": user_id, "room_uuid": room_id},
            )
            response.raise_for_status()
    except Exception as e:
        print(
            f"\033[031m[ERROR]\033[037m\t  Не удалось добавить пользователя в комнату: {e}"
        )


async def remove_user_from_room(user_id: str, room_id: str):
    """Удаление пользователя из комнаты

    Args:
        user_id (str): идентификатор пользователя
        room_id (str): идентификатор комнаты
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{API_BASE_URL}/delete_member",
                params={"user_uuid": user_id, "room_uuid": room_id},
            )
            response.raise_for_status()
    except Exception as e:
        print(
            f"\033[031m[ERROR]\033[037m\t  Не удалось удалить пользователя из комнаты: {e}"
        )


async def update_user_stats(user_id: str, type: str):
    """Обновление статистики игрока

    Args:
        user_id (str): идентификатор пользователя
        type (str): результат для обновления (wins/losses/draws)
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                "http://main_api:8080/api/users/update_stats",
                json={"user_uuid": user_id, "stat_type": type},
            )
            response.raise_for_status()
    except Exception as e:
        print(
            f"\033[031m[ERROR]\033[037m\t  Не удалось обновить ститистику пользователя: {e}"
        )


# Запросы по игре


async def add_game(room_id: str, game_id: str, is_hard: bool):
    """Создание игры в комнате

    Args:
        room_id (str): идентификатор комнаты
        game_id (str): идентификатор игры
        is_hard (bool): сложность игры (да/нет)
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_BASE_URL}/{room_id}/start_game?generated_id={game_id}&is_hard={is_hard}",
            )
            response.raise_for_status()
    except Exception as e:
        print(f"\033[031m[ERROR]\033[037m\t  Не удалось создать игру: {e}")


async def write_game_result(game_id: str, user_id: str, opponent_id: str, result: str):
    """Запись результата игры

    Args:
        game_id (str): идентификатор игры
        user_id (str): идентификатор игрока
        opponent_id (str): идентификатор оппонента игрока
        result (str): результат игры (win/lose/draw)
    """
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
        print(f"\033[031m[ERROR]\033[037m\t  Не удалось добавить результат: {e}")


async def update_game(game_id: str):
    """Обновление данных игры.
    Сейчас: запись окончания игры

    Args:
        game_id (str): идентификатор игры
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{API_BASE_URL}/games/{game_id}",
            )
            response.raise_for_status()
    except Exception as e:
        print(f"\033[031m[ERROR]\033[037m\t  Не удалось обновить игру: {e}")


async def delete_game(game_id: str):
    """Удаление игры

    Args:
        game_id (str): идентификатор игры
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{API_BASE_URL}/games/{game_id}",
            )
            response.raise_for_status()
    except Exception as e:
        print(f"\033[031m[ERROR]\033[037m\t  Не удалось удалить игру: {e}")


def check_draw(field: List[str]) -> bool:
    """Проверка текущего поля на состояние "Ничья"

    Args:
        field (List[str]): текущее поле игры

    Returns:
        bool: есть ничья или нет
    """
    return all(cell != "" for cell in field)


def check_winner(field: List[str]) -> Tuple[bool, List[int]]:
    """Проверка текущего поля игры на победу

    Args:
        field (List[str]): текущее поле игры

    Returns:
        Tuple[bool, List[int]]: победа или нет + выигрышная комбинация
    """
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
