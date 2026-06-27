// Cliente HTTP central de RentHub.
// Con el proxy de Vite activo, BASE_URL es vacío en dev: las rutas /api/*
// las intercepta Vite y las reenvía a http://localhost:8080 sin trailing slash.

const BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

const TOKEN_KEY = "renthub_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  raw?: boolean;
  auth?: boolean;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, raw = false, auth = false } = opts;

  // Quita trailing slash para que ASP.NET no devuelva 404
  const cleanPath = path.replace(/\/+$/, "");

  const headers: Record<string, string> = {};
  if (!raw && body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${cleanPath}`, {
    method,
    headers,
    body: raw ? (body as BodyInit) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const data = await res.json();
      message = data?.error || data?.message || message;
    } catch {
      /* respuesta sin cuerpo JSON */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return (await res.json()) as T;
  return (await res.blob()) as unknown as T;
}

export const http = {
  get: <T>(path: string, auth = false) => request<T>(path, { method: "GET", auth }),
  post: <T>(path: string, body?: unknown, auth = false) =>
    request<T>(path, { method: "POST", body, auth }),
  postRaw: <T>(path: string, body: BodyInit, auth = false) =>
    request<T>(path, { method: "POST", body, raw: true, auth }),
  delete: <T>(path: string, auth = false) => request<T>(path, { method: "DELETE", auth }),
  async getBlob(path: string, auth = false): Promise<Blob> {
    return request<Blob>(path, { method: "GET", auth });
  },
  baseUrl: BASE_URL,
};
