import { signAdminToken } from "@outfit-builder/contracts";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";

import { asyncHandler } from "../lib/async-handler.js";
import { env } from "../lib/env.js";
import { prisma } from "../lib/prisma.js";
import { createRateLimiter } from "../lib/rate-limit.js";
import { requireAdmin } from "../middleware/require-admin.js";

export const authRouter = Router();

// Login attempts are rate-limited to slow down credential guessing.
const loginLimiter = createRateLimiter();

const SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000; // matches admin-token.ts's EXPIRATION

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post(
  "/api/auth/login",
  loginLimiter,
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ error: "Invalid credentials" });
      return;
    }

    const { email, password } = parsed.data;

    // Generic message either way — never reveal whether the email matched
    // (avoids account enumeration).
    if (email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, env.ADMIN_PASSWORD_HASH);
    if (!passwordMatches) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const jti = randomUUID();
    await prisma.adminSession.create({
      data: { id: jti, email: env.ADMIN_EMAIL, expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS) },
    });

    const token = await signAdminToken(env.AUTH_SECRET, { email: env.ADMIN_EMAIL, role: "admin", jti });
    res.status(200).json({ token });
  }),
);

// Revokes the caller's own session so the JWT stops working before its 8h
// expiry — a stateless JWT can't be "un-issued", so this is what makes
// logout actually mean something server-side, not just a cleared cookie.
authRouter.post(
  "/api/auth/logout",
  requireAdmin,
  asyncHandler(async (req, res) => {
    await prisma.adminSession.update({
      where: { id: req.admin!.jti },
      data: { revokedAt: new Date() },
    });
    res.status(204).send();
  }),
);
