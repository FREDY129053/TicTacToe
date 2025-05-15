from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "rooms" (
    "id" UUID NOT NULL PRIMARY KEY,
    "name" VARCHAR(150) NOT NULL,
    "is_difficult" BOOL NOT NULL DEFAULT False,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "games" (
    "id" UUID NOT NULL PRIMARY KEY,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMPTZ,
    "is_difficult" BOOL NOT NULL,
    "room_id" UUID REFERENCES "rooms" ("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID NOT NULL PRIMARY KEY,
    "username" VARCHAR(100) NOT NULL,
    "password" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "game_results" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "opponent_id" UUID,
    "result" VARCHAR(4) NOT NULL,
    "game_id" UUID NOT NULL REFERENCES "games" ("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    CONSTRAINT "uid_game_result_game_id_6ba26a" UNIQUE ("game_id", "user_id")
);
COMMENT ON COLUMN "game_results"."result" IS 'WIN: win\nLOSE: lose\nDRAW: draw';
CREATE TABLE IF NOT EXISTS "room_members" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "room_id" UUID NOT NULL REFERENCES "rooms" ("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    CONSTRAINT "uid_room_member_room_id_ffb5ef" UNIQUE ("room_id", "user_id")
);
CREATE TABLE IF NOT EXISTS "user_stats" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "games_played" INT NOT NULL DEFAULT 0,
    "wins" INT NOT NULL DEFAULT 0,
    "losses" INT NOT NULL DEFAULT 0,
    "draws" INT NOT NULL DEFAULT 0,
    "user_id" UUID NOT NULL UNIQUE REFERENCES "users" ("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "aerich" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "version" VARCHAR(255) NOT NULL,
    "app" VARCHAR(100) NOT NULL,
    "content" JSONB NOT NULL
);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        """
