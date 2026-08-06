import { verifyAdminToken, type AdminJwtPayload } from "@outfit-builder/contracts";
import type { NextFunction, Request, Response } from "express";

import { env } from "../lib/env.js";
import { prisma } from "../lib/prisma.js";

// `declare global { namespace Express { ... } }` is the documented pattern
// for augmenting Express's Request type — not a stylistic namespace usage.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AdminJwtPayload;
    }
  }
}

// Independently re-verifies the JWT server-side — the frontend's own
// middleware check (apps/web/src/proxy.ts) is a UX convenience, not the
// security boundary.
export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : undefined;

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const admin = await verifyAdminToken(env.AUTH_SECRET, token);

    // The JWT's own signature/exp check above is necessary but not
    // sufficient — it can't reflect a logout that happened since the token
    // was issued. This lookup is what makes revocation real, at the cost
    // of one indexed read per admin request.
    const session = await prisma.adminSession.findUnique({ where: { id: admin.jti } });
    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      res.status(401).json({ error: "Invalid or expired session" });
      return;
    }

    req.admin = admin;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
}
