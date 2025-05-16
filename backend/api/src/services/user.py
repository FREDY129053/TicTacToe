import backend.api.src.repository.user as UserRepo
from backend.api.src.helpers import AvatarGenerator, check_pass, hash_pass
from backend.api.src.schemas import ServiceMessage


async def user_enter(username: str, password: str) -> ServiceMessage:
    user_in_db = await UserRepo.get_user_by_username(username=username)

    if user_in_db is None:
        avatar_url = AvatarGenerator(generate_string=username).generate_avatar_url()
        hashed_pass = hash_pass(password=password)
        uuid = await UserRepo.create_user(
            username=username, password=hashed_pass, avatar_url=avatar_url
        )

        return ServiceMessage(message=f"user created! UUID = {uuid}", status_code=201)
    else:
        is_right_pass = check_pass(
            hash_in_db=user_in_db.password, password_to_check=password
        )
        if is_right_pass:
            return ServiceMessage(message="login successfully", status_code=200)
        else:
            return ServiceMessage(
                is_error=True, message="wrong password", status_code=400
            )


async def get_users() -> ServiceMessage:
    users = await UserRepo.get_all_users()
    return ServiceMessage(message=users, status_code=200)
