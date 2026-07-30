import { createOutfitInputSchema } from "@outfit-builder/contracts";
import { Router } from "express";
import { z } from "zod";

import { asyncHandler } from "../lib/async-handler.js";
import { createRateLimiter } from "../lib/rate-limit.js";
import {
  createOutfit,
  deleteOutfit,
  getOutfitById,
  InvalidVariantError,
  listOutfits,
  ProductNotFoundError,
} from "../repositories/outfit-repository.js";

export const outfitsRouter = Router();

// Applied to write endpoints only (docs/07-security.md).
const writeLimiter = createRateLimiter();

const idParamSchema = z.object({ id: z.string().uuid() });

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

outfitsRouter.post(
  "/api/outfits",
  writeLimiter,
  asyncHandler(async (req, res) => {
    const parsed = createOutfitInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ error: "Invalid outfit data" });
      return;
    }

    try {
      const outfit = await createOutfit(parsed.data);
      res.status(201).json(outfit);
    } catch (error) {
      if (error instanceof ProductNotFoundError || error instanceof InvalidVariantError) {
        res.status(422).json({ error: error.message });
        return;
      }
      throw error;
    }
  }),
);

outfitsRouter.get(
  "/api/outfits",
  asyncHandler(async (req, res) => {
    const parsedQuery = listQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      res.status(422).json({ error: "Invalid query parameters" });
      return;
    }

    const result = await listOutfits(parsedQuery.data.page, parsedQuery.data.pageSize);
    res.status(200).json(result);
  }),
);

outfitsRouter.get(
  "/api/outfits/:id",
  asyncHandler(async (req, res) => {
    const parsedParams = idParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      res.status(422).json({ error: "Invalid outfit id" });
      return;
    }

    const outfit = await getOutfitById(parsedParams.data.id);
    if (!outfit) {
      res.status(404).json({ error: "Outfit not found" });
      return;
    }
    res.status(200).json(outfit);
  }),
);

outfitsRouter.delete(
  "/api/outfits/:id",
  writeLimiter,
  asyncHandler(async (req, res) => {
    const parsedParams = idParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      res.status(422).json({ error: "Invalid outfit id" });
      return;
    }

    const deleted = await deleteOutfit(parsedParams.data.id);
    if (!deleted) {
      res.status(404).json({ error: "Outfit not found" });
      return;
    }
    res.status(204).send();
  }),
);
