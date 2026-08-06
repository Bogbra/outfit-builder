import { Router } from "express";

import { asyncHandler } from "../lib/async-handler.js";
import { requireAdmin } from "../middleware/require-admin.js";
import { getAdminAnalytics } from "../repositories/analytics-repository.js";

export const adminAnalyticsRouter = Router();

adminAnalyticsRouter.get(
  "/api/admin/analytics",
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const analytics = await getAdminAnalytics();
    res.status(200).json(analytics);
  }),
);
