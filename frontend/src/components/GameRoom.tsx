interface IRoomProps {
  message: string;
  field: string[];
  isEndGame: boolean;
  makeMove: (index: number) => void;
  makeRestart: () => void;
  restartVotes: number;
}

export default function GameRoom({
  message,
  field,
  isEndGame,
  makeMove,
  makeRestart,
  restartVotes,
}: IRoomProps) {
  return (
    <div className="flex flex-col items-center gap-4 justify-center h-screen m-0 overflow-hidden bg-[#12bdac]">
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="mb-[2vmin] text-2xl font-bold text-[#f2ebd3] uppercase">
          {message[message.length - 1] === '.'
            ? (
                <div className="flex items-end gap-0.5">
                  <div className="leading-none">{message.slice(0, message.length-3)}</div>
                  <div className="flex space-x-0.5">
                    <div className="h-[6px] w-[6px] bg-[#f2ebd3] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-[6px] w-[6px] bg-[#f2ebd3] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-[6px] w-[6px] bg-[#f2ebd3] rounded-full animate-bounce"></div>
                  </div>
                </div>
              )
            : (
                <div>{message}</div>
              )
          }
        </div>
        <div className="board">
          {field.map((val, index) => (
            <div
              key={index}
              onClick={() => makeMove(index)}
              className={`cell ${val}`}
            ></div>
          ))}
        </div>
      </div>
      {isEndGame && (
        <div className="flex items-center justify-center flex-col">
          <button
            onClick={() => {
              makeRestart();
            }}
            className="px-6 py-4 border border-amber-300 bg-amber-200 rounded-lg cursor-pointer"
          >
            Restart ({restartVotes} / 2)
          </button>
        </div>
      )}
    </div>
  );
}
