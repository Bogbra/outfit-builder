import type { TryOnRequest } from "@prisma/client";
import { tryOnRequestInputSchema, type TryOnResponse } from "@outfit-builder/contracts";
import { Router } from "express";
import { z } from "zod";

import { asyncHandler } from "../lib/async-handler.js";
import { env } from "../lib/env.js";
import { FashnApiError, FashnContractError, FashnNotConfiguredError } from "../lib/fashn-client.js";
import { createRateLimiter } from "../lib/rate-limit.js";
import { InvalidPhotoError } from "../lib/validate-photo.js";
import {
  advanceTryOnRequest,
  createTryOnRequest,
  getTryOnRequestById,
  InvalidVariantError,
  NoTryOnEligibleItemsError,
  ProductNotFoundError,
} from "../repositories/try-on-repository.js";

export const tryOnRouter = Router();

// Real money per request against a third-party API, and a request can
// chain up to 3 upstream calls (one per TRY_ON_ELIGIBLE_CATEGORIES entry
// — see category.ts) — deliberately much stricter than the shared default
// limiter.
const tryOnLimiter = createRateLimiter({
  windowMs: env.TRYON_RATE_LIMIT_WINDOW_SECONDS * 1000,
  limit: env.TRYON_RATE_LIMIT_MAX_REQUESTS,
});

// Looser than tryOnLimiter — legitimate polling happens every 2s and a
// single chained run can add up to dozens of requests — but each poll can
// still advance the chain and trigger a paid provider call, so it isn't left
// unlimited.
const tryOnStatusLimiter = createRateLimiter({
  windowMs: env.TRYON_STATUS_RATE_LIMIT_WINDOW_SECONDS * 1000,
  limit: env.TRYON_STATUS_RATE_LIMIT_MAX_REQUESTS,
});

const idParamSchema = z.object({ id: z.string().uuid() });

function toTryOnResponse(request: TryOnRequest): TryOnResponse {
  const totalSteps = Array.isArray(request.items) ? request.items.length : 1;
  return {
    id: request.id,
    status: request.status,
    step: Math.min(request.currentStep + 1, totalSteps),
    totalSteps,
    resultImageUrl: request.resultImageUrl,
    error: request.errorMessage,
  };
}

tryOnRouter.post(
  "/api/try-on",
  tryOnLimiter,
  asyncHandler(async (req, res) => {
    const parsed = tryOnRequestInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ error: "Invalid try-on request" });
      return;
    }

    try {
      const request = await createTryOnRequest(parsed.data);
      res.status(201).json(toTryOnResponse(request));
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        res.status(422).json({ error: "One or more products could not be found" });
        return;
      }
      if (error instanceof InvalidVariantError) {
        res.status(422).json({ error: error.message });
        return;
      }
      if (error instanceof NoTryOnEligibleItemsError) {
        res.status(422).json({ error: error.message });
        return;
      }
      if (error instanceof InvalidPhotoError) {
        res.status(422).json({ error: error.message });
        return;
      }
      if (error instanceof FashnNotConfiguredError) {
        res.status(503).json({ error: "Virtual try-on is not currently available" });
        return;
      }
      if (error instanceof FashnApiError) {
        res.status(502).json({ error: "Virtual try-on service is temporarily unavailable" });
        return;
      }
      if (error instanceof FashnContractError) {
        res.status(502).json({ error: "Virtual try-on service returned an unexpected response" });
        return;
      }
      throw error;
    }
  }),
);

tryOnRouter.get(
  "/api/try-on/:id",
  tryOnStatusLimiter,
  asyncHandler(async (req, res) => {
    const parsedParams = idParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      res.status(422).json({ error: "Invalid try-on request id" });
      return;
    }

    let request = await getTryOnRequestById(parsedParams.data.id);
    if (!request) {
      res.status(404).json({ error: "Try-on request not found" });
      return;
    }

    if (request.status === "processing") {
      request = await advanceTryOnRequest(request);
    }

    res.status(200).json(toTryOnResponse(request));
  }),
);
