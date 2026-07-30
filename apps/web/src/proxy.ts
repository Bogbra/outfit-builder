import { verifyAdminToken } from "@outfit-builder/contracts";
import { NextResponse, type NextRequest } from "next/server";

// Runs on every page/API request except static assets — a nonce-based CSP
// (see buildCsp below) needs to apply everywhere, not just /admin, since
// the nonce has to match the actual page Next.js renders for each request.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

const SESSION_COOKIE = "admin_session";

function buildCsp(nonce: string): string {
  // Client Components fetch apps/api directly for outfit save/delete, so
  // connect-src must allow that origin or those requests get silently
  // blocked by the browser.
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

  return [
    "default-src 'self'",
    // 'strict-dynamic' + a per-request nonce is the Next.js-documented
    // pattern: the nonce'd bootstrap script is trusted to load every other
    // script Next.js needs, so host-based script allowlisting isn't
    // needed and 'unsafe-inline' is gone entirely for scripts.
    // 'unsafe-eval' is added in development only — Next.js/React use eval()
    // for Fast Refresh and dev-mode stack-trace reconstruction; production
    // never calls eval(), so the production CSP stays eval-free.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
    // style-src keeps 'unsafe-inline': Tailwind ships static CSS (no
    // runtime <style> injection), but React and several Radix primitives
    // set inline style="" *attributes* for dynamic positioning, and a
    // nonce only covers <style> elements, not style attributes — a
    // nonce-only style-src would silently break those. Deliberate
    // tradeoff, not an oversight.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://images.unsplash.com https://picsum.photos https://fastly.picsum.photos https://cdn.fashn.ai",
    "font-src 'self' data:",
    `connect-src 'self' ${apiOrigin}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

function withSecurityHeaders(response: NextResponse, csp: string): NextResponse {
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  // Belt-and-suspenders alongside frame-ancestors above — some older
  // browsers only understand this header, not CSP.
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export async function proxy(request: NextRequest) {
  const nonce = crypto.randomUUID().replaceAll("-", "");
  const csp = buildCsp(nonce);

  // Both headers must be set on the *request* Next.js continues on to
  // render with, not just the response: Next.js auto-detects the nonce by
  // reading it out of the incoming request's Content-Security-Policy
  // header, then stamps it onto the scripts it injects itself (RSC
  // bootstrap/hydration). x-nonce alone doesn't do this — only the CSP
  // header is read for that purpose.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const requestInit = { request: { headers: requestHeaders } };

  if (request.nextUrl.pathname.startsWith("/admin") && request.nextUrl.pathname !== "/admin/login") {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const secret = process.env.AUTH_SECRET;

    if (!token || !secret) {
      return withSecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)), csp);
    }

    try {
      // Verifies signature + expiry — apps/api's requireAdmin re-verifies
      // independently on every request; this is a UX redirect, not the
      // security boundary.
      await verifyAdminToken(secret, token);
    } catch {
      return withSecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)), csp);
    }
  }

  return withSecurityHeaders(NextResponse.next(requestInit), csp);
}
