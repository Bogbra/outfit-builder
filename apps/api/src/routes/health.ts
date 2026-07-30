import { Router } from "express";

import { asyncHandler } from "../lib/async-handler.js";
import { prisma } from "../lib/prisma.js";

export const healthRouter = Router();

// A readiness check, not a bare liveness check: it confirms the database
// is actually reachable, so an orchestrator (Cloud Run, k8s) can tell a
// process that's up but can't serve requests from one that's genuinely
// healthy.
healthRouter.get(
  "/healthz",
  asyncHandler(async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ status: "ok" });
    } catch {
      res.status(503).json({ status: "unavailable" });
    }
  }),
);
