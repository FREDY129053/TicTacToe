import GameRoom from "@/components/GameRoom";
import { decodeJWT } from "@/functions/decodeJWT";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import GameLayout from "@/components/layouts/GameLayout";

export default function Game() {
  const router = useRouter();
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const [message, setMessage] = useState<string>("Поиск соперника...");
  const [field, setField] = useState<string[]>(Array(9).fill(""));
  const [isEndGame, setIsEndGame] = useState<boolean>(false);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [restartVotes, setRestartVotes] = useState<number>(0);

  const symbolRef = useRef<"X" | "O" | "">("");
  const moveQueue = useRef(new Queue());

  const makeRestart = () => {
    socket?.send(
      JSON.stringify({
        method: "restart",
      })
    );
  };

  const [isReady, setIsReady] = useState(false);
  const [uuid, setUuid] = useState<string | null>(null);
  const [isDifficult, setIsDifficult] = useState(false);

  const makeMove = useCallback(
    (index: number) => {
      if (!isGameActive || field[index] !== "") return;

      const newField = [...field];
      if (isDifficult && moveQueue.current.size() === 3) {
        const removed = moveQueue.current.dequeue();
        newField[removed] = "";
      }

      moveQueue.current.enqueue(index);
      newField[index] = symbolRef.current;
      setField(newField);

      setIsGameActive(false);

      socket?.send(
        JSON.stringify({
          method: "move",
          symbol: symbolRef.current,
          field: newField,
        })
      );
    },
    [field, isDifficult, isGameActive, socket]
  );

  useEffect(() => {
    if (router.isReady) {
      const u = router.query.uuid as string;
      const hard = router.query.is_hard === "true";
      setUuid(u);
      setIsDifficult(hard);
      setIsReady(true);
    }
  }, [router]);

  useEffect(() => {
    if (!isReady || !uuid) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Ошибка: токен отсутствует");
      return;
    }

    const userUUID = decodeJWT(token);
    if (!userUUID) {
      setMessage("Ошибка: не удалось декодировать токен");
      return;
    }

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/game/${uuid}?user_id=${userUUID}&is_hard=${isDifficult}`
    );

    ws.onopen = () => {
      console.log("✅ WebSocket соединение установлено");
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
          break;

        case "result":
          setField(response.field);
          setIsGameActive(false);
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
          setIsGameActive(symbolRef.current === response.turn);
          setIsEndGame(false);
          setMessage(
            symbolRef.current === response.turn
              ? "Ваш ход"
              : "Ожидаем соперника..."
          )
          moveQueue.current = new Queue();
          setRestartVotes(0);
          break;

        case "left":
          setIsGameActive(false);
          setIsEndGame(false);
          setMessage(response.message);
          setField(Array(9).fill(""))
          break;

        default:
          console.warn("Неизвестный метод:", response);
      }
    };

    ws.onclose = (e) => {
      console.warn("❌ WebSocket отключён", e.code, e.reason);
    };

    ws.onerror = (err) => {
      console.error("WebSocket ошибка", err);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [isReady, uuid, isDifficult]);

  return (
    <GameLayout>
      <GameRoom
        message={message}
        field={field}
        isEndGame={isEndGame}
        makeMove={makeMove}
        makeRestart={makeRestart}
        restartVotes={restartVotes}
      />
    </GameLayout>
  );
}

class Queue {
  items: number[] = [];

  enqueue(item: number) {
    this.items.push(item);
  }

  dequeue(): number {
    return this.items.length === 0 ? -1 : this.items.shift()!;
  }

  size(): number {
    return this.items.length;
  }
}
