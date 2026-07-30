import type { TryOnRequest } from "@prisma/client";
import { categorySchema, type Category, type TryOnRequestInput } from "@outfit-builder/contracts";
import { z } from "zod";

import {
  FashnNotConfiguredError,
  getTryOnStepStatus,
  startTryOnStep,
  type FashnStepStatus,
} from "../lib/fashn-client.js";
import { prisma } from "../lib/prisma.js";

export class ProductNotFoundError extends Error {
  constructor(public readonly productId: string) {
    super(`Product ${productId} not found or inactive`);
    this.name = "ProductNotFoundError";
  }
}

export class InvalidVariantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidVariantError";
  }
}

// Garments are tried on base-to-outer, with accessories/footwear last —
// fashn.ai treats outerwear/footwear/accessories as additive layers over
// whatever's already on the model, so this order matters for a coherent
// final image, not just cosmetic ordering.
const CATEGORY_ORDER: readonly Category[] = ["top", "bottom", "jacket", "shoes", "bag", "accessory"];

const tryOnItemSchema = z.object({ category: categorySchema, garmentImageUrl: z.string().url() });
const tryOnItemsSchema = z.array(tryOnItemSchema);
type TryOnItem = z.infer<typeof tryOnItemSchema>;

const ONE_HOUR_MS = 60 * 60 * 1000;

// Resolves real product images server-side — the client only ever sends
// productId/category, never a garment URL (same "never trust the client"
// principle outfit-repository.ts follows for price). Kicks off the first
// fashn.ai chain step before writing anything, so a failed first call never
// leaves an orphaned row behind.
export async function createTryOnRequest(input: TryOnRequestInput): Promise<TryOnRequest> {
  const productIds = input.items.map((item) => item.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } });
  const productById = new Map(products.map((product) => [product.id, product]));

  const itemsByCategory = new Map<Category, TryOnItem>();
  for (const item of input.items) {
    const product = productById.get(item.productId);
    if (!product) {
      throw new ProductNotFoundError(item.productId);
    }
    // Category is taken from the product, never from the client's claim —
    // the same "never trust client-submitted data" principle
    // outfit-repository.ts follows for price/category. Otherwise a client
    // could mislabel a product's category and have it try on (and be
    // stored) in the wrong step of the chain.
    if (itemsByCategory.has(product.category)) {
      throw new InvalidVariantError(`Only one item per category is allowed, got two for ${product.category}`);
    }
    // product.images always has >=1 element — productSchema enforces
    // .min(1) at every write path.
    itemsByCategory.set(product.category, { category: product.category, garmentImageUrl: product.images[0]! });
  }

  const orderedItems: TryOnItem[] = CATEGORY_ORDER.filter((category) => itemsByCategory.has(category)).map(
    (category) => itemsByCategory.get(category)!,
  );

  // orderedItems always has >=1 element — tryOnRequestInputSchema enforces
  // .min(1) on input.items at the API boundary.
  const fashnPredictionId = await startTryOnStep({
    modelImage: input.photo,
    garmentImage: orderedItems[0]!.garmentImageUrl,
  });

  return prisma.tryOnRequest.create({
    data: {
      status: "processing",
      items: orderedItems,
      currentStep: 0,
      fashnPredictionId,
      expiresAt: new Date(Date.now() + ONE_HOUR_MS),
    },
  });
}

// Excludes expired rows so a stale request can't keep being polled (and
// keep advancing the paid fashn.ai chain) indefinitely.
export async function getTryOnRequestById(id: string): Promise<TryOnRequest | null> {
  return prisma.tryOnRequest.findFirst({ where: { id, expiresAt: { gt: new Date() } } });
}

// The reconcile-on-poll step: called from GET /api/try-on/:id whenever the
// row is still "processing". Checks the current fashn.ai step; if it just
// completed and more garments remain, kicks off the next chain step. No
// background worker drives this — the client's own polling does, since no
// async/job infra exists elsewhere in this codebase to reuse.
export async function advanceTryOnRequest(request: TryOnRequest): Promise<TryOnRequest> {
  if (!request.fashnPredictionId) {
    return prisma.tryOnRequest.update({
      where: { id: request.id },
      data: { status: "failed", errorMessage: "Try-on request has no in-flight prediction" },
    });
  }

  let stepStatus: FashnStepStatus;
  try {
    stepStatus = await getTryOnStepStatus(request.fashnPredictionId);
  } catch (error) {
    if (error instanceof FashnNotConfiguredError) {
      return prisma.tryOnRequest.update({
        where: { id: request.id },
        data: { status: "failed", errorMessage: "Virtual try-on is not currently available" },
      });
    }
    // Transient upstream error checking status — leave the row as
    // "processing" so the client's next poll retries, rather than failing
    // the whole request on a single network blip.
    return request;
  }

  if (stepStatus.status === "processing") {
    return request;
  }

  if (stepStatus.status === "failed") {
    return prisma.tryOnRequest.update({
      where: { id: request.id },
      data: { status: "failed", errorMessage: stepStatus.error },
    });
  }

  const items = tryOnItemsSchema.parse(request.items);
  const nextStepIndex = request.currentStep + 1;

  if (nextStepIndex >= items.length) {
    return prisma.tryOnRequest.update({
      where: { id: request.id },
      data: {
        status: "completed",
        currentStep: nextStepIndex,
        lastStepImageUrl: stepStatus.outputUrl,
        resultImageUrl: stepStatus.outputUrl,
      },
    });
  }

  try {
    // nextStepIndex < items.length, just checked above.
    const nextPredictionId = await startTryOnStep({
      modelImage: stepStatus.outputUrl,
      garmentImage: items[nextStepIndex]!.garmentImageUrl,
    });
    return await prisma.tryOnRequest.update({
      where: { id: request.id },
      data: {
        currentStep: nextStepIndex,
        lastStepImageUrl: stepStatus.outputUrl,
        fashnPredictionId: nextPredictionId,
      },
    });
  } catch {
    // A mid-chain failure still returns a clean "failed" status to the
    // client, rather than surfacing a raw 500 from a poll request.
    return prisma.tryOnRequest.update({
      where: { id: request.id },
      data: { status: "failed", errorMessage: "Failed to continue the try-on chain" },
    });
  }
}
