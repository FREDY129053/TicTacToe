import { IUserAtRoomData } from "@/interfaces/IUser";
import Image from "next/image";
import { useEffect, useState } from "react";
import Confetti from 'react-confetti'
import { useWindowSize } from "react-use";

interface IRoomProps {
  message: string;
  field: string[];
  isEndGame: boolean;
  makeMove: (index: number) => void;
  makeReady: () => void;
  readyVotes: number;
  currentPlayer: "left" | "right" | null;
  isShowMessage: boolean;
  me: IUserAtRoomData | null;
  opponent: IUserAtRoomData | null;
  isWinner: boolean
  isWaitingReady: boolean
}

export default function GameRoom({
  message,
  field,
  isEndGame,
  makeMove,
  makeReady,
  readyVotes,
  currentPlayer,
  isShowMessage,
  me,
  opponent,
  isWinner,
  isWaitingReady
}: IRoomProps) {
  const [dots, setDots] = useState("");
  const {width, height} = useWindowSize()

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col items-center gap-2 justify-center h-screen m-0 overflow-hidden bg-[#12bdac] px-4 sm:px-12">
      {isWinner && <Confetti width={width} height={height} run={isWinner} />}
      <div className="w-full top-4 left-0 absolute">
        <div className="relative w-full flex justify-between items-center px-4 md:px-24 text-[#f2ebd3] text-sm md:text-lg font-medium">
          <div
            className={`flex gap-3 items-center truncate max-w-[45%] ring-2 rounded-xl p-1 ${
              !isEndGame
                ? currentPlayer === "left"
                  ? "ring-yellow-300"
                  : "ring-transparent"
                : "ring-transparent"
            }`}
          >
            {me ? (
              <>
                <Image
                  className="rounded-xl border border-white w-12 h-12 md:w-16 md:h-16"
                  src={me.avatar_url}
                  width={64}
                  height={64}
                  alt="Avatar"
                />
                <div className="flex flex-col truncate">
                  <span className="truncate">{me.username}</span>
                  {!isEndGame
                    ? currentPlayer === "left" && (
                        <span className="text-xs text-yellow-200">
                          Твой ход{dots}
                        </span>
                      )
                    : ""}
                </div>
              </>
            ) : (
              <div>Loading...</div>
            )}
          </div>

          <span className="absolute left-1/2 -translate-x-1/2 text-center text-base md:text-xl font-bold uppercase select-none pointer-events-none">
            VS
          </span>

          <div
            className={`flex gap-3 items-center truncate max-w-[45%] justify-end ring-2 rounded-xl p-1 ${
              !isEndGame
                ? currentPlayer === "right"
                  ? "ring-yellow-300"
                  : "ring-transparent"
                : "ring-transparent"
            }`}
          >
            {opponent ? (
              <>
                <div className="flex flex-col items-end truncate order-1">
                  <span className="truncate">{opponent.username}</span>
                  {!isEndGame
                    ? currentPlayer === "right" && (
                        <span className="text-xs text-yellow-200">
                          Ход соперника{dots}
                        </span>
                      )
                    : ""}
                </div>
                <Image
                  className="rounded-xl border border-white w-12 h-12 md:w-16 md:h-16 order-2"
                  src={opponent.avatar_url}
                  width={64}
                  height={64}
                  alt="Avatar"
                />
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 mt-4">
        <div className="text-xl md:text-2xl font-bold text-[#f2ebd3] uppercase text-center min-h-[2em]">
          {isShowMessage && message.endsWith(".") ? (
            <div className="flex items-end gap-0.5">
              <div className="leading-none">{message.slice(0, -3)}</div>
              <div className="flex space-x-0.5">
                <div className="h-[6px] w-[6px] bg-[#f2ebd3] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="h-[6px] w-[6px] bg-[#f2ebd3] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="h-[6px] w-[6px] bg-[#f2ebd3] rounded-full animate-bounce" />
              </div>
            </div>
          ) : isShowMessage ? (message) : (<></>)}
        </div>

        <div className="board">
          {field.map((val, index) => (
            <div
              key={index}
              onClick={() => makeMove(index)}
              className={`cell ${val}`}
            />
          ))}
        </div>
      </div>

      {isWaitingReady && (
        <div className="mt-6">
          <button
            onClick={makeReady}
            className="px-6 py-4 border border-amber-300 bg-amber-200 rounded-lg cursor-pointer hover:bg-amber-300 transition"
          >
            Готов {readyVotes} / 2
          </button>
        </div>
      )}
    </div>
  );
}
