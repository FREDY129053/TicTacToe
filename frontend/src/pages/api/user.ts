import { IUserAtRoomData } from "@/interfaces/IUser";

export interface FullUser {
  id: string;
  username: string;
  password: string;
  avatar_url: string;
  created_at: string; // или `Date`, если хочешь парсить
}

export interface Stats {
  user_id: string
  losses: number
  id: number
  draws: number
  wins: number
  games_played: number
}

export async function getUserById(userId: string): Promise<FullUser> {
  const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Ошибка при получении пользователя: ${res.statusText}`);
  }

  const user: FullUser = await res.json();
  return user;
}

export async function getUserStats(userId: string): Promise<Stats> {
  const res = await fetch(`http://localhost:8080/api/users/stats?user_uuid=${userId}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Ошибка при получении пользователя: ${res.statusText}`);
  }

  const stats: Stats = await res.json();
  return stats;
}


export async function getOpponent(roomId: string): Promise<IUserAtRoomData | null> {
  const res = await fetch(`http://localhost:8080/api/rooms/${roomId}/opponent`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error(`Ошибка при получении пользователя: ${res.statusText}`);
  }

  return await res.json()
}
