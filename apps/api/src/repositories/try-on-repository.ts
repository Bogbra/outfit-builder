import type { TryOnRequest } from "@prisma/client";
import {
  categorySchema,
  TRY_ON_ELIGIBLE_CATEGORIES,
  type Category,
  type TryOnRequestInput,
} from "@outfit-builder/contracts";
import { z } from "zod";

import {
  FashnApiError,
  FashnContractError,
  FashnNotConfiguredError,
  getTryOnStepStatus,
  startTryOnStep,
  type FashnStepStatus,
} from "../lib/fashn-client.js";
import { prisma } from "../lib/prisma.js";
import { validatePhotoDataUrl } from "../lib/validate-photo.js";

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

export class NoTryOnEligibleItemsError extends Error {
  constructor() {
    super("None of the selected items can be virtually tried on (only tops, bottoms and jackets are supported)");
    this.name = "NoTryOnEligibleItemsError";
  }
}

// Garments are tried on base-to-outer — jacket last, over whatever's
// already on the model — so this order matters for a coherent final
// image, not just cosmetic ordering. Only TRY_ON_ELIGIBLE_CATEGORIES ever
// reach this chain (see category.ts for why shoes/bag/accessory don't).
const CATEGORY_ORDER: readonly Category[] = ["top", "bottom", "jacket"];

const tryOnItemSchema = z.object({ category: categorySchema, garmentImageUrl: z.string().url() });
const tryOnItemsSchema = z.array(tryOnItemSchema);
type TryOnItem = z.infer<typeof tryOnItemSchema>;

const ONE_HOUR_MS = 60 * 60 * 1000;

// Any 4xx except 429: a request-shaped-wrong or caller-not-allowed
// problem — retrying the exact same status check against the exact same
// prediction id will not turn any of these into a success. 429 (rate
// limited) and 5xx are deliberately excluded: those are about fashn.ai's
// own capacity/load, not this request, so they're worth retrying.
function isPermanentFashnClientError(error: FashnApiError): boolean {
  return error.status !== undefined && error.status >= 400 && error.status < 500 && error.status !== 429;
}

// Caps *transient* polling failures (network blips, 5xx, 429) before
// giving up — without this, a genuinely down upstream would have a
// try-on request poll (and consume its status-endpoint rate-limit budget)
// indefinitely until its 1-hour local expiry. Persisted on the row itself
// since each retry is a separate client poll hitting a stateless process,
// not a loop this function can just retry in-place.
const MAX_TRANSIENT_POLL_FAILURES = 5;

// Resolves real product images server-side — the client only ever sends
// productId/category, never a garment URL (same "never trust the client"
// principle outfit-repository.ts follows for price). Kicks off the first
// fashn.ai chain step before writing anything, so a failed first call never
// leaves an orphaned row behind.
export async function createTryOnRequest(input: TryOnRequestInput): Promise<TryOnRequest> {
  // Rejects a corrupt/mistyped/non-image payload before any DB write or
  // paid fashn.ai call — tryOnRequestInputSchema's own regex only checked
  // the data URL's prefix, not its actual content.
  validatePhotoDataUrl(input.photo);

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
    //
    // Items outside TRY_ON_ELIGIBLE_CATEGORIES are silently skipped rather
    // than rejecting the whole request — the outfit builder always passes
    // the full outfit, and a shoes/bag/accessory item shouldn't block
    // trying on the top/bottom/jacket that *are* supported. The dialog UI
    // also filters these client-side, so this is defense-in-depth against
    // a client that skips that filtering, not the primary UX path.
    if (!TRY_ON_ELIGIBLE_CATEGORIES.includes(product.category)) {
      continue;
    }
    if (itemsByCategory.has(product.category)) {
      throw new InvalidVariantError(`Only one item per category is allowed, got two for ${product.category}`);
    }
    // product.images always has >=1 element — productSchema enforces
    // .min(1) at every write path.
    itemsByCategory.set(product.category, { category: product.category, garmentImageUrl: product.images[0]! });
  }

  if (itemsByCategory.size === 0) {
    throw new NoTryOnEligibleItemsError();
  }

  const orderedItems: TryOnItem[] = CATEGORY_ORDER.filter((category) => itemsByCategory.has(category)).map(
    (category) => itemsByCategory.get(category)!,
  );

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

    // A contract violation (unparseable/unexpected response shape, or a
    // disallowed output host) won't fix itself by polling the same
    // prediction id again — fail immediately rather than burning through
    // retries on a response that will never look different.
    if (error instanceof FashnContractError) {
      return prisma.tryOnRequest.update({
        where: { id: request.id },
        data: { status: "failed", errorMessage: "Virtual try-on service returned an unexpected response" },
      });
    }

    // Only getTryOnStepStatus's own documented error types get treated as
    // "the provider had a problem" — anything else (a TypeError, a bug)
    // is a real defect in this process and must surface as one, not get
    // silently absorbed into the poll-failure counter below.
    if (!(error instanceof FashnApiError)) {
      throw error;
    }

    // A definite client-side/auth problem (bad/revoked API key, malformed
    // request, unknown prediction id) — also permanent, also not worth
    // retrying.
    if (isPermanentFashnClientError(error)) {
      return prisma.tryOnRequest.update({
        where: { id: request.id },
        data: { status: "failed", errorMessage: "Virtual try-on service rejected the request" },
      });
    }

    // Everything else here is transient by elimination: a network
    // failure/timeout (no status at all), a 429, or a 5xx — fashn.ai's
    // side, not this request's. Retried up to MAX_TRANSIENT_POLL_FAILURES
    // times before giving up.
    const pollFailureCount = request.pollFailureCount + 1;
    if (pollFailureCount >= MAX_TRANSIENT_POLL_FAILURES) {
      return prisma.tryOnRequest.update({
        where: { id: request.id },
        data: { status: "failed", errorMessage: "Virtual try-on service is temporarily unavailable" },
      });
    }
    return prisma.tryOnRequest.update({ where: { id: request.id }, data: { pollFailureCount } });
  }

  if (stepStatus.status === "processing") {
    // Resets a failure streak once the upstream is actually responding
    // again — only writes when there's something to reset, so a healthy
    // poll (the overwhelmingly common case) stays a read-only no-op, same
    // as before this retry logic existed.
    if (request.pollFailureCount > 0) {
      return prisma.tryOnRequest.update({ where: { id: request.id }, data: { pollFailureCount: 0 } });
    }
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
        pollFailureCount: 0,
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
        pollFailureCount: 0,
      },
    });
  } catch (error) {
    // Same principle as the status-check catch above: only startTryOnStep's
    // own documented error types are "the provider had a problem" and get
    // turned into a clean "failed" status instead of a raw 500. Anything
    // else (a TypeError, a Prisma error) is a real defect in this process
    // and must surface as one.
    if (
      !(
        error instanceof FashnApiError ||
        error instanceof FashnContractError ||
        error instanceof FashnNotConfiguredError
      )
    ) {
      throw error;
    }
    return prisma.tryOnRequest.update({
      where: { id: request.id },
      data: { status: "failed", errorMessage: "Failed to continue the try-on chain" },
    });
  }
}
