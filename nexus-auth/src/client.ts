// 对接中央 auth-service。浏览器请求带 cookie（credentials:include），
// 同域子路径下 JWT 自动随 cookie 走，实现单点登录。
// AUTH_BASE 默认空串 = 同域（生产经 nginx 走 /auth/...）；本地用 NEXT_PUBLIC_AUTH_BASE 指向 auth-service。

declare const process: { env: Record<string, string | undefined> } | undefined;
const AUTH_BASE =
  (typeof process !== "undefined" && process?.env?.NEXT_PUBLIC_AUTH_BASE) || "";

export type User = { id: number; email: string; role: string };

async function req(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${AUTH_BASE}${path}`, {
    credentials: "include",
    ...opts,
  });
  let body: any = null;
  try { body = await res.json(); } catch { /* ignore */ }
  if (!res.ok) throw new Error((body && body.error) || `HTTP ${res.status}`);
  return body;
}

export function login(email: string, password: string): Promise<{ user: User; access_token: string }> {
  return req("/auth/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export function register(email: string, password: string): Promise<{ user: User; access_token: string }> {
  return req("/auth/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export function logout(): Promise<{ ok: boolean }> {
  return req("/auth/api/logout", { method: "POST" });
}

export function fetchMe(): Promise<{ user: User }> {
  return req("/auth/api/me");
}
