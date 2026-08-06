import { CSRF_COOKIE } from "./csrf";

// Client-only — reads the non-httpOnly CSRF cookie so it can be echoed back
// as a header on mutating requests (double-submit pattern, see csrf.ts).
export function readCsrfCookie(): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`));
  return match?.[1];
}
