// Generates docs/openapi.yaml from the actual Zod schemas in
// packages/contracts (plus a few request-only schemas defined here) —
// generated from the real source of truth rather than hand-written prose,
// so it can't silently drift the way docs/04-api-contract.md's markdown
// once did (see docs/final-review.md). Run with `pnpm --filter api
// generate:openapi`.
import {
  extendZodWithOpenApi,
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";
import {
  adminProductFormSchema,
  adminProductUpdateSchema,
  createOutfitInputSchema,
  outfitSchema,
  productSchema,
  tryOnRequestInputSchema,
  tryOnResponseSchema,
} from "@outfit-builder/contracts";
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { stringify } from "yaml";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

const errorResponseSchema = registry.register(
  "ErrorResponse",
  z.object({ error: z.string() }).openapi("ErrorResponse"),
);

const loginRequestSchema = registry.register(
  "LoginRequest",
  z.object({ email: z.string().email(), password: z.string().min(1) }).openapi("LoginRequest"),
);
const loginResponseSchema = registry.register(
  "LoginResponse",
  z.object({ token: z.string() }).openapi("LoginResponse"),
);

const productResponse = registry.register("Product", productSchema.openapi("Product"));
const adminProductPageResponse = registry.register(
  "AdminProductPage",
  z
    .object({ items: z.array(productSchema), total: z.number(), page: z.number(), pageSize: z.number() })
    .openapi("AdminProductPage"),
);
const outfitResponse = registry.register("Outfit", outfitSchema.openapi("Outfit"));
const outfitPageResponse = registry.register(
  "OutfitPage",
  z
    .object({ items: z.array(outfitSchema), total: z.number(), page: z.number(), pageSize: z.number() })
    .openapi("OutfitPage"),
);
const analyticsResponse = registry.register(
  "AdminAnalytics",
  z
    .object({
      totalProducts: z.number(),
      totalSavedOutfits: z.number(),
      mostUsedCategory: z.string().nullable(),
      averageOutfitPrice: z.number().nullable(),
    })
    .openapi("AdminAnalytics"),
);

const tryOnRequestSchema = registry.register("TryOnRequest", tryOnRequestInputSchema.openapi("TryOnRequest"));
const tryOnResponse = registry.register("TryOnResponse", tryOnResponseSchema.openapi("TryOnResponse"));

const bearerAuth = registry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

registry.registerPath({
  method: "get",
  path: "/healthz",
  operationId: "getHealth",
  summary: "Health check",
  security: [],
  responses: {
    200: { description: "OK" },
    503: { description: "Dependency (database) unavailable" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  operationId: "login",
  summary: "Admin login — rate-limited, returns a JWT",
  security: [],
  request: { body: { content: { "application/json": { schema: loginRequestSchema } } } },
  responses: {
    200: { description: "Login succeeded", content: { "application/json": { schema: loginResponseSchema } } },
    401: { description: "Invalid credentials", content: { "application/json": { schema: errorResponseSchema } } },
    422: { description: "Malformed request body", content: { "application/json": { schema: errorResponseSchema } } },
    429: { description: "Rate limited", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/outfits",
  operationId: "createOutfit",
  summary: "Save an outfit — price/completeness recomputed server-side",
  security: [],
  request: { body: { content: { "application/json": { schema: createOutfitInputSchema } } } },
  responses: {
    201: { description: "Created", content: { "application/json": { schema: outfitResponse } } },
    422: { description: "Invalid outfit data", content: { "application/json": { schema: errorResponseSchema } } },
    429: { description: "Rate limited", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/outfits",
  operationId: "listOutfits",
  summary: "List saved outfits",
  security: [],
  responses: {
    200: { description: "OK", content: { "application/json": { schema: outfitPageResponse } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/outfits/{id}",
  operationId: "getOutfit",
  summary: "Get a saved outfit",
  security: [],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: { description: "OK", content: { "application/json": { schema: outfitResponse } } },
    404: { description: "Not found", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/outfits/{id}",
  operationId: "deleteOutfit",
  summary: "Delete a saved outfit",
  security: [],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    204: { description: "Deleted" },
    404: { description: "Not found", content: { "application/json": { schema: errorResponseSchema } } },
    429: { description: "Rate limited", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/try-on",
  operationId: "startTryOn",
  summary: "Start a virtual try-on — kicks off the first chain step and returns immediately",
  security: [],
  request: { body: { content: { "application/json": { schema: tryOnRequestSchema } } } },
  responses: {
    201: { description: "Try-on started", content: { "application/json": { schema: tryOnResponse } } },
    422: { description: "Invalid request", content: { "application/json": { schema: errorResponseSchema } } },
    429: { description: "Rate limited", content: { "application/json": { schema: errorResponseSchema } } },
    502: { description: "Upstream try-on service failed", content: { "application/json": { schema: errorResponseSchema } } },
    503: { description: "Virtual try-on not configured", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/try-on/{id}",
  operationId: "getTryOnStatus",
  summary: "Poll a try-on request — may itself advance the chain one step further",
  security: [],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: { description: "OK", content: { "application/json": { schema: tryOnResponse } } },
    404: { description: "Not found", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/admin/products",
  operationId: "listAdminProducts",
  summary: "List all products, including inactive — admin only",
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: { description: "OK", content: { "application/json": { schema: adminProductPageResponse } } },
    401: { description: "Unauthenticated", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/admin/products/{id}",
  operationId: "getAdminProduct",
  summary: "Get one product, including inactive — admin only",
  security: [{ [bearerAuth.name]: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: { description: "OK", content: { "application/json": { schema: productResponse } } },
    401: { description: "Unauthenticated", content: { "application/json": { schema: errorResponseSchema } } },
    404: { description: "Not found", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/admin/products",
  operationId: "createAdminProduct",
  summary: "Create a product — admin only",
  security: [{ [bearerAuth.name]: [] }],
  request: { body: { content: { "application/json": { schema: adminProductFormSchema } } } },
  responses: {
    201: { description: "Created", content: { "application/json": { schema: productResponse } } },
    401: { description: "Unauthenticated", content: { "application/json": { schema: errorResponseSchema } } },
    422: { description: "Invalid product data", content: { "application/json": { schema: errorResponseSchema } } },
    429: { description: "Rate limited", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/admin/products/{id}",
  operationId: "updateAdminProduct",
  summary: "Partially update a product — admin only, absent fields are left unchanged",
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: { content: { "application/json": { schema: adminProductUpdateSchema } } },
  },
  responses: {
    200: { description: "Updated", content: { "application/json": { schema: productResponse } } },
    401: { description: "Unauthenticated", content: { "application/json": { schema: errorResponseSchema } } },
    404: { description: "Not found", content: { "application/json": { schema: errorResponseSchema } } },
    422: { description: "Invalid product data", content: { "application/json": { schema: errorResponseSchema } } },
    429: { description: "Rate limited", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/admin/analytics",
  operationId: "getAdminAnalytics",
  summary: "Live-computed catalog/outfit analytics — admin only",
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: { description: "OK", content: { "application/json": { schema: analyticsResponse } } },
    401: { description: "Unauthenticated", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

const document = new OpenApiGeneratorV3(registry.definitions).generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Outfit Builder API",
    version: "1.0.0",
    description:
      "REST surface of apps/api. The public product catalog is served over GraphQL instead (POST /graphql) — see docs/04-api-contract.md for its schema.",
    license: { name: "UNLICENSED" },
  },
  servers: [
    { url: "http://localhost:8080", description: "Local dev" },
    {
      url: "https://outfit-builder-api-REPLACE.a.run.app",
      description: "Cloud Run (placeholder — filled in per docs/11-deployment-ops.md after first deploy)",
    },
  ],
});

const outputPath = resolve(dirname(fileURLToPath(import.meta.url)), "../../../docs/openapi.yaml");
writeFileSync(outputPath, stringify(document), "utf-8");
console.info(`Wrote ${outputPath}`);
