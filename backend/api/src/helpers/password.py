import bcrypt


def hash_pass(password: str) -> str:
    """Хэширование пароля

    Args:
        password (str): пароль для хэширования

    Returns:
        str: хэш
    """
    salt = bcrypt.gensalt()

    return str(bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8"))


def check_pass(hash_in_db: str, password_to_check: str) -> bool:
    """Проверка пароля с хэшем

    Args:
        hash_in_db (str): хэш
        password_to_check (str): пароль для проверки

    Returns:
        bool: соотвествует пароль хэшу (да/нет)
    """
    return bcrypt.checkpw(
        hashed_password=hash_in_db.encode("utf-8"),
        password=password_to_check.encode("utf-8"),
    )
