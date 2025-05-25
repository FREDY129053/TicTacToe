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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const myAvatar = localStorage.getItem("meAvatar");
    const myUsername = localStorage.getItem("meUsername");
    const uuid = decodeJWT(token);
    if (!uuid) return;

    setMe({ avatar_url: myAvatar!, username: myUsername! });
    getUserStats(uuid).then(setStatistic).catch(console.error);
    getGames()
      .then((data) => {
        setIsLoading(false);
        setGames(data);
      })
      .catch(console.error);
      console.log(isLoading)
  }, [isLoading]);

  return (
    <MainLayout>
      <h2 className="w-full text-xl md:text-3xl text-center text-white font-semibold mb-8">
        Статистика игр
      </h2>
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
      <h2 className="text-xl md:text-3xl text-center text-white font-semibold mt-10 mb-6">
        История игр
      </h2>
      {!isLoading ? (
        <>
          {games.length !== 0 ? (
            <div className="flex flex-col gap-6 w-full">
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
            </div>
          ) : (
            <div className="text-xl md:text-2xl text-center mt-8 md:mt-16 text-white">Пусто, но всегда можно начать играть!</div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center align-middle h-full">
          <Loading size="w-11 h-11" />
        </div>
      )}
    </MainLayout>
  );
}
