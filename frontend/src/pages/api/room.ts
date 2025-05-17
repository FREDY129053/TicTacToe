import { IRoom } from "@/interfaces/IRoom";

export async function getRooms(): Promise<IRoom[]> {
  const res = await fetch('http://localhost:8080/api/rooms', {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Ошибка при получении комнат: ${res.statusText}`);
  }

  const rooms: IRoom[] = await res.json();
  return rooms;
}
