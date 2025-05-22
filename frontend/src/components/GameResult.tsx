import Image from "next/image";
import { IUserAtRoomData } from "@/interfaces/IUser";

interface Props {
  me: IUserAtRoomData | null;
  opponent: IUserAtRoomData | null;
  result: string;
  game_duration: number;
}

/* преобразуем секунды → HH:MM:SS / MM:SS */
function toHHMMSS(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return h ? `${h}:${m}:${s}` : `${m}:${s}`;
}

export default function GameResultCard({
  me,
  opponent,
  result,
  game_duration,
}: Props) {
  const time = toHHMMSS(game_duration);

  /* цвет результата */
  const resColor =
    result === "win"
      ? "text-green-400"
      : result === "lose"
      ? "text-red-400"
      : "text-yellow-300";

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl shadow-md shadow-black/20 p-5 transition hover:shadow-xl hover:scale-105 w-full max-w-xl mx-auto">
      {/* аватары и VS */}
      <div className="flex items-center justify-between mb-4">
        {/* левый игрок */}
        <PlayerItem user={me} align="left" />

        {/* центр: время / VS / результат */}
        <div className="flex flex-col items-center flex-shrink-0 mx-2 sm:mx-6">
          <span className="text-xs sm:text-sm text-[#cfd2ff] select-none">
            {time}
          </span>
          <span className="text-base sm:text-lg font-bold text-white select-none">
            VS
          </span>
          <span className={`text-sm sm:text-base font-semibold ${resColor}`}>
            {result}
          </span>
        </div>

        {/* правый игрок */}
        <PlayerItem user={opponent} align="right" />
      </div>
    </div>
  );
}

/* ───────── вспомогательный компонент игрока ───────── */
function PlayerItem({
  user,
  align,
}: {
  user: IUserAtRoomData | null;
  align: "left" | "right";
}) {
  if (!user)
    return (
      <div className="flex items-center gap-2 w-[120px] sm:w-[160px] h-12 bg-white/10 rounded-md animate-pulse" />
    );

  return (
    <div
      className={`flex items-center gap-2 sm:gap-3 max-w-[45%] truncate ${
        align === "right" ? "flex-row-reverse text-right" : ""
      }`}
    >
      <Image
        src={user.avatar_url}
        alt="Avatar"
        width={64}
        height={64}
        className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl border border-white object-cover flex-shrink-0"
      />
      <span className="truncate text-white font-medium">{user.username}</span>
    </div>
  );
}
