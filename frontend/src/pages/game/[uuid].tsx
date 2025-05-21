import GameRoom from "@/components/GameRoom";
import { decodeJWT } from "@/functions/decodeJWT";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import GameLayout from "@/components/layouts/GameLayout";
import { getOpponent, getUserById } from "@/pages/api/user";
import { IUserAtRoomData } from "@/interfaces/IUser";

export default function Game() {
  const router = useRouter();
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const [message, setMessage] = useState<string>("Поиск соперника...");
  const [field, setField] = useState<string[]>(Array(9).fill(""));
  const [isEndGame, setIsEndGame] = useState<boolean>(false);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [readyVotes, setReadyVotes] = useState<number>(0);
  const [currPlayer, setCurrPlayer] = useState<"left" | "right" | null>(null);
  const [isShowMessage, setIsShowMessage] = useState<boolean>(true);
  const [isWinner, setIsWinner] = useState<boolean>(false)
  const [isWaitingReady, setIsWaitingReady] = useState<boolean>(false)

  const symbolRef = useRef<"X" | "O" | "">("");
  const moveQueue = useRef(new Queue());

  const makeReady = () => {
    socket?.send(
      JSON.stringify({
        method: "game_start",
      })
    );
  };

  const [isReady, setIsReady] = useState(false);
  const [uuid, setUuid] = useState<string | null>(null);
  const [isDifficult, setIsDifficult] = useState(false);
  const [me, setMe] = useState<IUserAtRoomData|null>(null)
  const [opponent, setOpponent] = useState<IUserAtRoomData|null>(null)

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

    getUserById(userUUID)
    .then((user) => setMe({ avatar_url: user.avatar_url, username: user.username }))
    .catch(console.error);

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/game/${uuid}?user_id=${userUUID}&is_hard=${isDifficult}`
    );

    ws.onopen = () => {
      console.log("✅ WebSocket соединение установлено");
    };

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);

      switch (response.method) {
        case "start":
          setIsWaitingReady(true)
          setIsShowMessage(false);
          setMessage("w");
          getOpponent(uuid).then(setOpponent).catch(console.error)
          break;

        // case "join":
        //   symbolRef.current = response.symbol;
        //   setIsGameActive(response.symbol === response.turn);
        //   setCurrPlayer(response.symbol === response.turn ? "left" : "right");
        //   setMessage("w");
        //   setIsShowMessage(false);
        //   getOpponent(uuid).then(setOpponent).catch(console.error)
        //   break;

        case "update":
          setField(response.field);
          setIsGameActive(response.turn === symbolRef.current);
          setIsShowMessage(false);
          setCurrPlayer(symbolRef.current === response.turn ? "left" : "right");
          break;

        case "result":
          setField(response.field);
          setIsGameActive(false);
          setTimeout(() => {
            setMessage(response.message);
            setIsEndGame(true);
          }, 300);
          setIsWinner(response?.symbol === symbolRef.current)
          setIsShowMessage(true);
          break;

        case "ready_vote":
          setReadyVotes(response.votes);
          break;

        case "game_start":
          setField(response.field);
          symbolRef.current = response.symbol;
          setIsGameActive(response.symbol === response.turn);
          setCurrPlayer(response.symbol === response.turn ? "left" : "right");
          setIsEndGame(false);
          setIsShowMessage(false);
          setMessage("w");
          setIsWinner(false)
          moveQueue.current = new Queue();
          setReadyVotes(0);
          break;

        case "left":
          setIsGameActive(false);
          setIsEndGame(false);
          setMessage(response.message);
          setField(Array(9).fill(""));
          setOpponent(null)
          setIsWinner(false)
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
        makeReady={makeReady}
        readyVotes={readyVotes}
        currentPlayer={currPlayer}
        isShowMessage={isShowMessage}
        me={me}
        opponent={opponent}
        isWinner={isWinner}
        isWaitingReady={isWaitingReady}
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
