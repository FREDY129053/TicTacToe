from tortoise import fields
from tortoise.models import Model


class RoomMember(Model):
    room = fields.ForeignKeyField("models.Room", related_name="members")
    user = fields.ForeignKeyField("models.User", related_name="room_memberships")
    joined_at = fields.DatetimeField(auto_now_add=True)

    class Meta:  # type: ignore
        table = "room_members"
        unique_together = ("room", "user")
