import Image from "next/image";
import { IUserAtRoomData } from "@/interfaces/IUser";

interface Props {
  me: IUserAtRoomData | null;
  opponent: IUserAtRoomData | null;
  result: string;
  game_duration: number;
}

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

  const resColor =
    result === "win"
      ? "text-green-400"
      : result === "lose"
      ? "text-red-400"
      : "text-yellow-300";

  return (
    <div className="relative bg-white/5 border border-white/10 rounded-xl shadow-md shadow-black/20 p-6 transition hover:shadow-xl hover:scale-102 w-full max-w-5xl mx-auto">
      <div className="absolute left-1/2 top-5 -translate-x-1/2 flex flex-col items-center z-10">
        <span className="text-xs sm:text-sm text-[#cfd2ff] select-none">{time}</span>
        <span className="text-base sm:text-lg font-bold text-white select-none">VS</span>
        <span className={`text-sm sm:text-base font-semibold ${resColor}`}>
          {result}
        </span>
      </div>

      <div className="flex justify-between items-center px-2 sm:px-4">
        <PlayerItem user={me} align="left" />
        <div className="w-[96px] sm:w-[110px]" />
        <PlayerItem user={opponent} align="right" />
      </div>
    </div>
  );
}

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
