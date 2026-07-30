import type { NextFunction, Request, Response } from "express";

const CLIENT_ERROR_MESSAGES: Record<number, string> = {
  400: "Bad request",
  413: "Request body too large",
};

function getSafeClientStatus(err: unknown): number | undefined {
  if (typeof err !== "object" || err === null) return undefined;
  const status = "status" in err ? err.status : "statusCode" in err ? err.statusCode : undefined;
  // Only trust well-known 4xx codes from framework-level errors (e.g. the
  // body-parser PayloadTooLargeError this app's own express.json({ limit })
  // throws) — never any 5xx or arbitrary value, which could otherwise let a
  // thrown object smuggle an unintended status past this handler.
  return typeof status === "number" && status in CLIENT_ERROR_MESSAGES ? status : undefined;
}

// Safe error responses only — no stack traces or internals leak to clients.
// A known 4xx from framework-level parsing (e.g. an oversized body) keeps
// its real status with a generic message per status; everything else is
// treated as an opaque server error. See docs/07-security.md.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err);
  const clientStatus = getSafeClientStatus(err);
  if (clientStatus) {
    res.status(clientStatus).json({ error: CLIENT_ERROR_MESSAGES[clientStatus] });
    return;
  }
  res.status(500).json({ error: "Internal server error" });
}
