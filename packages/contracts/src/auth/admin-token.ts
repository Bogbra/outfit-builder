import { jwtVerify, SignJWT } from "jose";

// Shared between apps/api (issues the token, Node runtime) and apps/web's
// middleware (verifies the session cookie, Edge runtime) — see
// docs/07-security.md "Auth". `secret` is passed in rather than read from
// env here so this module stays runtime-agnostic.
const ISSUER = "outfit-builder-api";
const AUDIENCE = "outfit-builder-admin";
const EXPIRATION = "8h";

export interface AdminJwtPayload {
  email: string;
  role: "admin";
  // Session id — lets apps/api's session store revoke one specific token
  // (e.g. on logout) without needing a shared-secret rotation to invalidate
  // every outstanding token. See docs/07-security.md "Session revocation".
  jti: string;
}

export interface SignAdminTokenInput {
  email: string;
  role: "admin";
  // Caller-supplied so apps/api can persist the same id as a session row
  // before/alongside issuing the token — this module has no DB access of
  // its own (it's also imported by apps/web's Edge middleware).
  jti: string;
}

export async function signAdminToken(secret: string, payload: SignAdminTokenInput): Promise<string> {
  const secretKey = new TextEncoder().encode(secret);
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(payload.jti)
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(EXPIRATION)
    .sign(secretKey);
}

export async function verifyAdminToken(secret: string, token: string): Promise<AdminJwtPayload> {
  const secretKey = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, secretKey, { issuer: ISSUER, audience: AUDIENCE });

  if (payload.role !== "admin" || typeof payload.email !== "string" || typeof payload.jti !== "string") {
    throw new Error("Invalid admin token payload");
  }

  return { email: payload.email, role: "admin", jti: payload.jti };
}
