import os

from dotenv import load_dotenv


def load_environment():
    """Загрузка перемнных среды из файла"""
    env_file = f"{os.path.dirname(os.path.abspath(__file__))}\\.env"  # type: ignore

    if os.path.exists(env_file):
        load_dotenv(env_file, override=True)
        print("\033[32mINFO\033[0m:\t  env vars loaded")
    else:
        print(f"\033[31mERROR\033[0m:\t  {env_file} not found! Create it!!!")


def validate_environment():
    """Проверка переменных среды"""
    required_vars = ["TOKEN_EXPIRE_MINUTES", "ALGORITHM", "JWT_SECRET_KEY"]
    missing = [var for var in required_vars if not os.getenv(var)]
    if missing:
        raise EnvironmentError(f"Missing required env vars: {missing}")
