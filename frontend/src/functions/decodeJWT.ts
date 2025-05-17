import {jwtDecode} from "jwt-decode";

interface JWTPayload {
  uuid: string
  exp: number
}

export const decodeJWT = (token: string | null): string | null => {
  if (!token) return null;
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return decoded.uuid;
  } catch (e) {
    console.error("Ошибка при декодировании токена:", e);
    return null;
  }
}
