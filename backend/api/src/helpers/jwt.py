import os
from datetime import datetime, timedelta
from typing import Dict, Union

from jose import JWTError, jwt

TOKEN_EXPIRE_MINUTES = 30
ALGORITHM = "HS256"
JWT_SECRET_KEY = "крестик и нолик"


def create_jwt_token(data: Dict[str, str], expires_delta: int = None) -> str:
    """Генерация JWT токена

    Args:
        data (Dict[str, str]): данные для генерации токена
        expires_delta (int, optional): время истечения. Defaults to None.

    Returns:
        str: сгенерированный токен
    """
    if expires_delta is not None:
        expires_delta = datetime.now() + timedelta(minutes=expires_delta)
    else:
        expires_delta = datetime.now() + timedelta(minutes=float(TOKEN_EXPIRE_MINUTES))

    data_copy = data.copy()
    data_copy["exp"] = expires_delta

    to_encode = data_copy
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, ALGORITHM)

    return encoded_jwt


def decode_jwt_token(token: str) -> Union[Dict, None]:
    """Расшифровка JWT токена

    Args:
        token (str): токен

    Returns:
        Union[Dict, None]: данные токена в виде словаря при расшифровке или ничего при ошибке
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
