// Double-submit cookie CSRF pattern. admin_session (httpOnly) proves who you
// are; this cookie (readable by client JS) proves the request actually came
// from a page this origin served — a cross-site form/fetch can ride the
// ambient session cookie automatically, but can't read this one to echo it
// back in a header.
//
// Constants only in this file (safe to import from Client Components, e.g.
// to read the cookie and set the header) — the verification function lives
// in verify-csrf.ts since it needs next/headers (server-only).
export const CSRF_COOKIE = "csrf_token";
export const CSRF_HEADER = "x-csrf-token";
// Matches admin_session's lifetime (apps/web/src/app/api/admin/login/route.ts).
export const CSRF_MAX_AGE_SECONDS = 60 * 60 * 8;

export function generateCsrfToken(): string {
  return crypto.randomUUID().replaceAll("-", "");
}
