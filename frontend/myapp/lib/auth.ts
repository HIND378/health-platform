import { User } from "./types";

export function parseJwt(token: string): User | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function saveToken(token: string) {
  localStorage.setItem("token", token);
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function clearToken() {
  localStorage.removeItem("token");
}

export function getCurrentUser(): User | null {
  const token = getStoredToken();
  if (!token) return null;
  return parseJwt(token);
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}