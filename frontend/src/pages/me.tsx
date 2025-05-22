import MainLayout from "@/components/layouts/MainLayout";
import React, { useEffect, useState } from "react";
import { decodeJWT } from "@/functions/decodeJWT";
import { Stats, getUserStats, GameResult, getGames } from "./api/user";
import Loading from "@/components/Loading";
import { PlayerStatsDonutChart } from "@/components/DonutStats";
import { IUserAtRoomData } from "@/interfaces/IUser";
import GameResultCard from "@/components/GameResult";

export default function Me() {
  const [statistic, setStatistic] = useState<Stats | null>(null);
  const [games, setGames] = useState<GameResult[]>([]);
  const [me, setMe] = useState<IUserAtRoomData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const myAvatar = localStorage.getItem("meAvatar");
    const myUsername = localStorage.getItem("meUsername");
    const uuid = decodeJWT(token);
    if (!uuid) return;

    setMe({ avatar_url: myAvatar!, username: myUsername! });
    getUserStats(uuid).then(setStatistic).catch(console.error);
    getGames().then(setGames).catch(console.error);
  }, []);

  return (
    <MainLayout>
      {statistic ? (
        <PlayerStatsDonutChart
          wins={statistic.wins}
          losses={statistic.losses}
          draws={statistic.draws}
        />
      ) : (
        <div className="flex items-center justify-center align-middle h-full">
          <Loading size="w-11 h-11" />
        </div>
      )}
      <h2>История игр</h2>
      {games.map((game, index) => (
        <GameResultCard
          key={index}
          me={me}
          opponent={{
            avatar_url: game.opponent_avatar,
            username: game.opponent_username,
          }}
          result={game.result}
          game_duration={game.game_duration_seconds}
        />
      ))}
    </MainLayout>
  );
}
