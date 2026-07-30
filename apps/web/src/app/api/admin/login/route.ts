import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/lib/env";
import { CSRF_COOKIE, CSRF_MAX_AGE_SECONDS, generateCsrfToken } from "@/features/admin/api/csrf";

const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // matches the JWT's 8h expiry

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

interface LoginApiResponse {
  token?: string;
  error?: string;
}

// Server-to-server call to apps/api — no CORS involved. On success, stores
// the returned JWT in an httpOnly cookie scoped to this origin; the browser
// never sees the raw token. See docs/07-security.md "Auth".
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 422 });
  }

  const apiResponse = await fetch(`${env.API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  const json = (await apiResponse.json().catch(() => null)) as LoginApiResponse | null;

  if (!apiResponse.ok || !json?.token) {
    return NextResponse.json({ error: json?.error ?? "Login failed" }, { status: apiResponse.status || 500 });
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, json.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  // Deliberately NOT httpOnly — the admin product form's client-side fetch
  // calls need to read this to echo it back in the X-CSRF-Token header.
  cookieStore.set(CSRF_COOKIE, generateCsrfToken(), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CSRF_MAX_AGE_SECONDS,
  });

  return NextResponse.json({ success: true });
}
