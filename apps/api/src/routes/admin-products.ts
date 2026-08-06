import { adminProductFormSchema, adminProductUpdateSchema } from "@outfit-builder/contracts";
import { Router } from "express";
import { z } from "zod";

import { asyncHandler } from "../lib/async-handler.js";
import { createRateLimiter } from "../lib/rate-limit.js";
import { requireAdmin } from "../middleware/require-admin.js";
import {
  createProduct,
  DuplicateSlugError,
  getAdminProductById,
  listAdminProducts,
  updateProduct,
} from "../repositories/admin-product-repository.js";

export const adminProductsRouter = Router();

adminProductsRouter.use("/api/admin/products", requireAdmin);

// Product mutations are rate-limited too, separate budget from the public
// write endpoints.
const writeLimiter = createRateLimiter();

const listQuerySchema = z.object({
  search: z.string().max(200).optional(),
  sortBy: z.enum(["name", "priceMinor", "createdAt"]).default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

const idParamSchema = z.object({ id: z.string().uuid() });

adminProductsRouter.get(
  "/api/admin/products",
  asyncHandler(async (req, res) => {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(422).json({ error: "Invalid query parameters" });
      return;
    }
    const result = await listAdminProducts(parsed.data);
    res.status(200).json(result);
  }),
);

adminProductsRouter.get(
  "/api/admin/products/:id",
  asyncHandler(async (req, res) => {
    const parsedParams = idParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      res.status(422).json({ error: "Invalid product id" });
      return;
    }
    const product = await getAdminProductById(parsedParams.data.id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.status(200).json(product);
  }),
);

adminProductsRouter.post(
  "/api/admin/products",
  writeLimiter,
  asyncHandler(async (req, res) => {
    const parsed = adminProductFormSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ error: "Invalid product data" });
      return;
    }
    try {
      const product = await createProduct(parsed.data);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof DuplicateSlugError) {
        res.status(422).json({ error: error.message });
        return;
      }
      throw error;
    }
  }),
);

adminProductsRouter.patch(
  "/api/admin/products/:id",
  writeLimiter,
  asyncHandler(async (req, res) => {
    const parsedParams = idParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      res.status(422).json({ error: "Invalid product id" });
      return;
    }
    const parsedBody = adminProductUpdateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(422).json({ error: "Invalid product data" });
      return;
    }
    try {
      const product = await updateProduct(parsedParams.data.id, parsedBody.data);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      res.status(200).json(product);
    } catch (error) {
      if (error instanceof DuplicateSlugError) {
        res.status(422).json({ error: error.message });
        return;
      }
      throw error;
    }
  }),
);
