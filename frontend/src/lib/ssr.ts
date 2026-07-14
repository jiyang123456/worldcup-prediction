export class BackendError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "BackendError";
  }
}

const backendUrl =
  process.env.BACKEND_INTERNAL_URL ?? "http://localhost:7001";

export async function fetchBackend<T>(path: string): Promise<T> {
  const res = await fetch(`${backendUrl}${path}`, {
    cache: "no-store",
    headers: { "content-type": "application/json" },
  });
  if (!res.ok) {
    throw new BackendError(res.status, `请求失败 (${res.status})`);
  }
  const body = (await res.json()) as { data: T };
  return body.data;
}
