from tortoise import fields
from tortoise.models import Model
from backend.api.src.enums import Result


class GameResult(Model):
    id = fields.IntField(pk=True)
    game = fields.ForeignKeyField("models.Game", related_name="results")
    user = fields.ForeignKeyField("models.User", related_name="game_results")
    opponent_id = fields.UUIDField(null=True)
    result = fields.CharEnumField(Result)

    class Meta:  # type: ignore
        table = "game_results"
