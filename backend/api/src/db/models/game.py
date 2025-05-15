import uuid

from tortoise import fields
from tortoise.models import Model

from .game_result import GameResult


class Game(Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    room = fields.ForeignKeyField("models.Room", related_name="games", null=True)
    started_at = fields.DatetimeField(auto_now_add=True)
    ended_at = fields.DatetimeField(null=True)
    is_difficult = fields.BooleanField()

    results: fields.ReverseRelation["GameResult"]

    class Meta:  # type: ignore
        table = "games"
