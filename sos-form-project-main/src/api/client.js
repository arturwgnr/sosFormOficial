// src/api/client.js
// Fetch wrapper fino: sempre manda o cookie de sessão (credentials:
// "include"), sempre fala/entende JSON, e lança um erro com o texto que
// o backend mandou (nunca uma mensagem genérica de rede).
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  constructor(message, { status, issues } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.issues = issues;
  }
}

async function request(path, { method = "GET", body, query } = {}) {
  const url = new URL(`${BASE_URL}/api${path}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }

  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiError(data?.error || "Não foi possível completar a ação.", {
      status: res.status,
      issues: data?.issues,
    });
  }

  return data;
}

export const api = {
  get: (path, query) => request(path, { method: "GET", query }),
  post: (path, body) => request(path, { method: "POST", body: body ?? {} }),
  patch: (path, body) => request(path, { method: "PATCH", body: body ?? {} }),
};
