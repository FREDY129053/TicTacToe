import uuid

from tortoise import fields
from tortoise.models import Model

from .game_result import GameResult
from .room_member import RoomMember


class User(Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    username = fields.CharField(max_length=100)
    password = fields.TextField()
    avatar_url = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    stats: fields.ReverseRelation["UserStats"]
    game_results: fields.ReverseRelation["GameResult"]
    room_memberships: fields.ReverseRelation["RoomMember"]

    class Meta:  # type: ignore
        table = "users"


class UserStats(Model):
    user = fields.OneToOneField("models.User", related_name="stats")
    games_played = fields.IntField(default=0)
    wins = fields.IntField(default=0)
    losses = fields.IntField(default=0)
    draws = fields.IntField(default=0)

    class Meta:  # type: ignore
        table = "user_stats"
