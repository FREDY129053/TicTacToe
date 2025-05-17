import GameRoom from "@/components/GameRoom";
import { decodeJWT } from "@/functions/decodeJWT";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Game() {
  // Системные вещи о комнате и пользователе
  // const userUUID = decodeJWT(localStorage.getItem("token"));
  const router = useRouter();
  const { uuid, is_hard } = router.query;
  const isDifficult = is_hard === "true" ? true : false;

  // Переменные сокетов
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // Переменные игры
  const [message, setMessage] = useState<string>("searching...");
  const [field, setField] = useState<string[]>(Array(9).fill(""));
  const [isEndGame, setIsEndGame] = useState<boolean>(false);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [restartVotes, setRestartVotes] = useState<number>(0);
  const symbolRef = useRef<"X" | "O" | "">("");
  const moveQueue = useRef(new Queue());

  const makeMove = useCallback(
    (index: number) => {
      if (!isGameActive || field[index] !== "") return;

      setIsGameActive(false);

      const newField = [...field];

      if (isDifficult) {
        const queue = moveQueue.current;

        if (queue.size() === 3) {
          const removeIndex = queue.dequeue();
          newField[removeIndex] = "";
        }
        queue.enqueue(index);
      }

      newField[index] = symbolRef.current;

      setField(newField);

      socket?.send(
        JSON.stringify({
          method: "move",
          symbol: symbolRef.current,
          field: newField,
        })
      );
    },
    [field, isGameActive, socket, isDifficult]
  );

  const makeRestart = () => {
    socket?.send(
      JSON.stringify({
        method: "restart",
      })
    );
  };

  useEffect(() => {
    const userUUID = decodeJWT(localStorage.getItem("token"));

    if (!userUUID || !uuid || !is_hard) return;

    const updateBoard = (newField: string[]) => {
      setField(newField);
    };

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/game/${uuid}?user_id=${userUUID}&is_hard=${is_hard}`
    );

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);

      switch (response.method) {
        case "join":
          symbolRef.current = response.symbol;
          setIsGameActive(response.symbol === response.turn);
          setMessage(
            response.symbol === response.turn
              ? "Ваш ход"
              : "Ожидаем соперника..."
          );
          break;

        case "update":
          setField(response.field);
          setIsGameActive(response.turn === symbolRef.current);
          setMessage(
            symbolRef.current === response.turn
              ? "Ваш ход"
              : "Ожидаем соперника..."
          );
          updateBoard(response.field);
          break;

        case "result":
          setField(response.field);
          setIsGameActive(false);
          updateBoard(response.field);

          setTimeout(() => {
            setMessage(response.message);
            setIsEndGame(true);
          }, 300);
          break;

        case "restart_vote":
          setRestartVotes(response.votes);
          break;

        case "restart":
          setField(response.field);
          setIsGameActive(true);
          setIsEndGame(false);
          setMessage(response.message);
          moveQueue.current = new Queue();
          setRestartVotes(0);
          break;

        case "left":
          setIsGameActive(false);
          setIsEndGame(false);
          setMessage(response.message);
          break;
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [is_hard, uuid]);

  return (
    <GameRoom
      message={message}
      field={field}
      isEndGame={isEndGame}
      makeMove={makeMove}
      makeRestart={makeRestart}
      restartVotes={restartVotes}
    />
  );
}

class Queue {
  items: number[];
  constructor() {
    this.items = [];
  }

  enqueue(element: number) {
    this.items.push(element);
  }

  dequeue(): number {
    return this.isEmpty() ? -1 : this.items.shift()!;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }

  print() {
    console.log(this.items.join(" -> "));
  }
}
