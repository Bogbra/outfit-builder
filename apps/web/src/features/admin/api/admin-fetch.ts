import { cookies } from "next/headers";

import { env } from "@/lib/env";

const SESSION_COOKIE = "admin_session";

export class AdminApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

// Server-only (reads the httpOnly session cookie via next/headers) — use
// from Server Components/Route Handlers, never Client Components. Forwards
// the session as a Bearer token to apps/api, which independently verifies
// it.
export async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  return fetch(`${env.API_URL}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
}

export async function adminFetchJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await adminFetch(path, init);

  if (!response.ok) {
    const json: unknown = await response.json().catch(() => null);
    const message =
      json && typeof json === "object" && "error" in json && typeof json.error === "string"
        ? json.error
        : `Request failed with status ${response.status}`;
    throw new AdminApiError(message, response.status);
  }

  return response.json();
}
