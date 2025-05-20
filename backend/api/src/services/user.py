from uuid import UUID
import backend.api.src.repository.user as UserRepo
from backend.api.src.helpers import (
    AvatarGenerator,
    check_pass,
    create_jwt_token,
    hash_pass,
)
from backend.api.src.schemas import ServiceMessage, UpdateStats


async def user_enter(username: str, password: str) -> ServiceMessage:
    user_in_db = await UserRepo.get_user_by_username(username=username)

    if user_in_db is None:
        avatar_url = AvatarGenerator(generate_string=username).generate_avatar_url()
        hashed_pass = hash_pass(password=password)
        uuid = await UserRepo.create_user(
            username=username, password=hashed_pass, avatar_url=avatar_url
        )

        token = create_jwt_token({"uuid": str(uuid)})

        return ServiceMessage(message=token, status_code=201)
    else:
        is_right_pass = check_pass(
            hash_in_db=user_in_db.password, password_to_check=password
        )
        if is_right_pass:
            token = create_jwt_token({"uuid": str(user_in_db.id)})
            return ServiceMessage(message=token, status_code=200)
        else:
            return ServiceMessage(
                is_error=True, message="Неверный пароль!", status_code=400
            )


async def get_users() -> ServiceMessage:
    users = await UserRepo.get_all_users()
    return ServiceMessage(message=users, status_code=200)


async def get_user_by_uuid(uuid: UUID) -> ServiceMessage:
    user = await UserRepo.get_user(uuid=uuid)

    if user is None:
        return ServiceMessage(is_error=True, message="user not found", status_code=404)

    return ServiceMessage(message=user, status_code=200)


async def update_stats(data: UpdateStats) -> ServiceMessage:
    wins, losses, draws = False, False, False
    print(f"DEBUG\t{data.stat_type}")
    if data.stat_type == "wins":
        wins = True
    if data.stat_type == "losses":
        losses = True
    if data.stat_type == "draws":
        draws = True

    _ = await UserRepo.update_stats(data.user_uuid, wins, losses, draws)

    return ServiceMessage(message="updated stats", status_code=200)


async def get_stats(uuid: UUID) -> ServiceMessage:
    result = await UserRepo.get_stats(uuid)
    return ServiceMessage(message=result, status_code=200)
