import os
from datetime import datetime, timedelta
from typing import Dict, Union

from jose import JWTError, jwt


def create_jwt_token(data: Dict[str, str], expires_delta: int = None) -> str:
    if expires_delta is not None:
        expires_delta = datetime.now() + expires_delta
    else:
        expires_delta = datetime.now() + timedelta(
            minutes=float(os.getenv("TOKEN_EXPIRE_MINUTES"))
        )

    data_copy = data.copy()
    data_copy["exp"] = expires_delta

    to_encode = data_copy
    encoded_jwt = jwt.encode(
        to_encode, os.getenv("JWT_SECRET_KEY"), os.getenv("ALGORITHM")
    )

    return encoded_jwt


def decode_jwt_token(token: str) -> Union[Dict, None]:
    try:
        payload = jwt.decode(
            token, os.getenv("JWT_SECRET_KEY"), algorithms=[os.getenv("ALGORITHM")]
        )
        return payload
    except JWTError:
        return None
