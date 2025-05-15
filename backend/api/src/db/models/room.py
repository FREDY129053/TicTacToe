import uuid

from tortoise import fields
from tortoise.models import Model

from .game import Game
from .room_member import RoomMember


class Room(Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    name = fields.CharField(max_length=150)
    is_difficult = fields.BooleanField(default=False)
    created_at = fields.DatetimeField(auto_now_add=True)

    members: fields.ReverseRelation["RoomMember"]
    games: fields.ReverseRelation["Game"]

    class Meta:  # type: ignore
        table = "rooms"
