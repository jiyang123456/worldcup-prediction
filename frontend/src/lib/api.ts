import type { ApiError, ApiErrorCode } from "@/lib/types";

const TOKEN_KEY = "wc_token";

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public code: ApiErrorCode | null,
    message: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    let message = `请求失败 (${response.status})`;
    let code: ApiErrorCode | null = null;
    try {
      const errorBody = (await response.json()) as ApiError;
      if (errorBody?.error?.message) {
        message = errorBody.error.message;
      }
      if (errorBody?.error?.code) {
        code = errorBody.error.code;
      }
    } catch {
      // 响应体无法解析为 JSON 时回退到默认消息
    }
    throw new ApiRequestError(response.status, code, message);
  }

  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
