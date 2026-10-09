import { cookies, headers } from "next/headers";
import { verifyToken, type JWTPayload } from "./auth";

const COOKIE_NAME = "locket_token";

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<JWTPayload | null> {
  // 1. Đọc từ cookie
  const cookieStore = await cookies();
  let token = cookieStore.get(COOKIE_NAME)?.value;

  // 2. Fallback: đọc từ Authorization Bearer
  if (!token) {
    try {
      const headerStore = await headers();
      const authHeader = headerStore.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    } catch {}
  }

  if (!token) return null;
  return verifyToken(token);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export const SESSION_COOKIE = COOKIE_NAME;
