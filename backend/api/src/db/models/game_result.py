from tortoise import fields
from tortoise.models import Model
from enum import StrEnum


class Result(StrEnum):
    WIN = "win"
    LOSE = "lose"
    DRAW = "draw"


class GameResult(Model):
    game = fields.ForeignKeyField("models.Game", related_name="results")
    user = fields.ForeignKeyField("models.User", related_name="game_results")
    opponent_id = fields.UUIDField(null=True)
    result = fields.CharEnumField(Result)

    class Meta:  # type: ignore
        table = "game_results"
        unique_together = ("game", "user")
