import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const winningCombs = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function isWinner(board: string[], player: string) {
  for (const comb of winningCombs) {
    const [a, b, c] = comb;
    if (board[a] === player && board[a] === board[b] && board[a] === board[c]) {
      return true;
    }
  }
  return false;
}

function getWinComb(board: string[], player: string): number[] {
  for (const comb of winningCombs) {
    const [a, b, c] = comb;
    if (board[a] === player && board[a] === board[b] && board[a] === board[c]) {
      return [a, b, c];
    }
  }
  return [];
}

function emptyIndices(board: string[]) {
  return board
    .map((s, i) => (s !== "O" && s !== "X" ? i : null))
    .filter((i) => i !== null) as number[];
}

export default function GameRoom() {
  const { width, height } = useWindowSize();
  const [hasWinner, setHasWinner] = useState(false);
  const [field, setField] = useState(Array(9).fill(""));
  const [winComb, setWinComb] = useState<number[]>([]);
  const [isGameActive, setIsGameActive] = useState(true);
  const [message, setMessage] = useState("Ваш ход...");

  const humanPlayer = "X";
  const bot = "O";

  useEffect(() => {
    if (isWinner(field, humanPlayer)) {
      setHasWinner(true);
      setWinComb(getWinComb(field, humanPlayer));
      setMessage("Вы победили!")
      setIsGameActive(false);
      return;
    }
    if (isWinner(field, bot)) {
      setHasWinner(false);
      setWinComb(getWinComb(field, bot));
      setMessage("Компьютер выиграл")
      setIsGameActive(false);
      return;
    }
    if (emptyIndices(field).length === 0) {
      setHasWinner(false);
      setMessage("Ничья")
      setIsGameActive(false);
      return;
    }

    function minMax(
      newBoard: string[],
      player: string
    ): { index: number; score: number } {
      const availSpots = emptyIndices(newBoard);

      if (isWinner(newBoard, humanPlayer)) {
        return { score: -10, index: -1 };
      } else if (isWinner(newBoard, bot)) {
        return { score: 10, index: -1 };
      } else if (availSpots.length === 0) {
        return { score: 0, index: -1 };
      }

      const moves = [];
      for (let i = 0; i < availSpots.length; i++) {
        const move = {
          index: availSpots[i],
          score: 0,
        };

        newBoard[availSpots[i]] = player;

        if (player === bot) {
          const result = minMax(newBoard, humanPlayer);
          move.score = result.score;
        } else {
          const result = minMax(newBoard, bot);
          move.score = result.score;
        }

        newBoard[availSpots[i]] = "";

        moves.push(move);
      }

      let bestMove: number = 0;

      if (player === bot) {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
          if (moves[i].score > bestScore) {
            bestScore = moves[i].score!;
            bestMove = i;
          }
        }
      } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
          if (moves[i].score < bestScore) {
            bestScore = moves[i].score!;
            bestMove = i;
          }
        }
      }

      return moves[bestMove];
    }

    if (!isGameActive && !hasWinner) {
      setMessage("Бот думает...");
      setTimeout(() => {
        const best = minMax([...field], bot);
        if (best.index !== undefined && best.index !== -1) {
          const newField = [...field];
          newField[best.index] = bot;
          setField(newField);
          setIsGameActive(true);
          setMessage("Ваш ход...")
        }
      }, 600);
    }
  }, [field, hasWinner, isGameActive]);

  const makeMove = (index: number) => {
    if (!isGameActive) return;

    const newField = [...field];
    newField[index] = humanPlayer;
    setField(newField);
    setIsGameActive(false);
  };

  return (
    <div className="relative flex flex-col items-center gap-2 justify-center h-screen m-0 overflow-hidden bg-[#12bdac] px-4 sm:px-12">
      {hasWinner && <Confetti width={width} height={height} run={hasWinner} />}

      <div className="flex flex-col items-center justify-center gap-6 mt-4">
        <div className="text-xl md:text-2xl font-bold text-[#f2ebd3] uppercase text-center min-h-[2em]">
          {message.endsWith(".") ? (
            <div className="flex items-end gap-0.5">
              <div className="leading-none">{message.slice(0, -3)}</div>
              <div className="flex space-x-0.5">
                <div className="h-[6px] w-[6px] bg-[#f2ebd3] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="h-[6px] w-[6px] bg-[#f2ebd3] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="h-[6px] w-[6px] bg-[#f2ebd3] rounded-full animate-bounce" />
              </div>
            </div>
          ) : (
            message
          )}
        </div>

        <div className="board">
          {field.map((val, index) => (
            <div
              key={index}
              onClick={() => makeMove(index)}
              className={`cell ${
                winComb.includes(index) ? "bg-red-300!" : ""
              } ${val}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
