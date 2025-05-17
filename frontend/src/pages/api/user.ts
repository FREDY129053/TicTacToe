export interface FullUser {
  id: string;
  username: string;
  password: string;
  avatar_url: string;
  created_at: string; // или `Date`, если хочешь парсить
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
