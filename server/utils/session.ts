import { setCookie, getCookie, deleteCookie } from "h3";

export function setUserSession(event: any, userId: number) {
  setCookie(event, "userId", String(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearUserSession(event: any) {
  deleteCookie(event, "userId", {
    path: "/"
  });
}

export function getUserIdFromSession(event: any): number | null {
  const raw = getCookie(event, "userId");

  if (!raw) {
    return null;
  }

  const userId = Number(raw);

  if (!Number.isFinite(userId)) {
    return null;
  }

  return userId;
}