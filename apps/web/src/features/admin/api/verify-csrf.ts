import { cookies } from "next/headers";

import { CSRF_COOKIE, CSRF_HEADER } from "./csrf";

// Server-only (next/headers) — call from a Route Handler, never a Client
// Component. See csrf.ts for the pattern this implements.
export async function verifyCsrf(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value;
  const headerToken = request.headers.get(CSRF_HEADER);
  return Boolean(cookieToken) && cookieToken === headerToken;
}
