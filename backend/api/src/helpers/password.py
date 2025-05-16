import bcrypt


def hash_pass(password: str) -> str:
    salt = bcrypt.gensalt()

    return str(bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8"))


def check_pass(hash_in_db: str, password_to_check: str) -> bool:
    return bcrypt.checkpw(
        hashed_password=hash_in_db.encode("utf-8"),
        password=password_to_check.encode("utf-8"),
    )
