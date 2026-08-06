import { z } from "zod";

import { env } from "./env.js";

// Deliberately narrower than contracts' ALLOWED_IMAGE_HOSTS, which also
// allows images.unsplash.com/picsum.photos for seed/demo product photos —
// those hosts have nothing to do with fashn.ai and must never be treated
// as a trusted try-on *result*. This is the actual, complete list of
// hosts fashn.ai itself serves generated output from.
const FASHN_OUTPUT_HOSTS = new Set(["cdn.fashn.ai", "media.fashn.ai"]);

export function isAllowedFashnOutputUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && FASHN_OUTPUT_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

// The only outbound third-party API call in this codebase — isolated here
// so try-on-repository.ts never talks to fashn.ai directly, and so tests
// can mock this one module instead of stubbing global fetch.
const FASHN_BASE_URL = "https://api.fashn.ai/v1";

// Both calls only submit/poll a job — they don't wait for image generation
// itself — so a slow response past this means the upstream call is hung,
// not just working hard.
const FASHN_REQUEST_TIMEOUT_MS = 15_000;

// A non-2xx HTTP response, or a network failure/timeout. `status` is the
// HTTP status code when one was actually received (undefined for a
// timeout/connection failure) — try-on-repository.ts uses it to tell a
// permanent client-side problem (401/403/404/422 — retrying won't help)
// from a transient one (5xx, or no status at all — retrying might).
export class FashnApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "FashnApiError";
  }
}

// The request succeeded (2xx) but the response body doesn't match what
// fashn.ai documents — an unrecognized status value, a missing/disallowed
// output URL, or a shape that doesn't parse at all. Distinct from
// FashnApiError because retrying an HTTP-level failure can make sense;
// retrying an already-2xx response that just doesn't mean what the code
// expects it to mean will not.
export class FashnContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FashnContractError";
  }
}

export class FashnNotConfiguredError extends Error {
  constructor() {
    super("FASHN_API_KEY is not configured");
    this.name = "FashnNotConfiguredError";
  }
}

function requireApiKey(): string {
  if (!env.FASHN_API_KEY) {
    throw new FashnNotConfiguredError();
  }
  return env.FASHN_API_KEY;
}

// response.json() throws (a SyntaxError, uncaught) on a non-JSON body —
// fashn.ai returning a 2xx with an unparseable body is exactly the "the
// contract doesn't hold" case FashnContractError exists for, not a
// network-level FashnApiError and not an unhandled exception.
async function parseProviderJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new FashnContractError("fashn.ai returned a response that was not valid JSON");
  }
}

interface StartTryOnStepInput {
  modelImage: string;
  garmentImage: string;
}

export async function startTryOnStep({ modelImage, garmentImage }: StartTryOnStepInput): Promise<string> {
  const apiKey = requireApiKey();

  let response: Response;
  try {
    response = await fetch(`${FASHN_BASE_URL}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model_name: "tryon-v1.6",
        inputs: {
          model_image: modelImage,
          garment_image: garmentImage,
          // tryon-v1.6 only documents auto/tops/bottoms/one-pieces as valid
          // categories — try-on-repository.ts only ever sends
          // top/bottom/jacket garment images here in the first place (see
          // TRY_ON_ELIGIBLE_CATEGORIES), so "auto" always resolves to one
          // of the categories this model actually supports.
          category: "auto",
          // Public, unauthenticated, user-content endpoint — deliberately
          // stricter than fashn's own "permissive" default.
          moderation_level: "conservative",
        },
      }),
      signal: AbortSignal.timeout(FASHN_REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new FashnApiError("fashn.ai run request timed out or failed to connect");
  }

  if (!response.ok) {
    throw new FashnApiError(`fashn.ai run request failed with status ${response.status}`, response.status);
  }

  const body = await parseProviderJson(response);
  if (typeof body !== "object" || body === null || typeof (body as { id?: unknown }).id !== "string") {
    throw new FashnContractError("fashn.ai run response did not include a prediction id");
  }

  return (body as { id: string }).id;
}

export type FashnStepStatus =
  | { status: "processing" }
  | { status: "completed"; outputUrl: string }
  | { status: "failed"; error: string };

// fashn.ai's documented status values (as of writing) — starting/in_queue
// are pre-processing states we still treat as "processing" from the
// caller's perspective, since there's nothing different to do for them.
const fashnStatusResponseSchema = z.object({
  status: z.enum(["starting", "in_queue", "processing", "completed", "failed"]),
  output: z.array(z.string()).optional(),
  error: z
    .union([z.string(), z.object({ message: z.string().optional() }).passthrough(), z.null()])
    .optional(),
});

export async function getTryOnStepStatus(predictionId: string): Promise<FashnStepStatus> {
  const apiKey = requireApiKey();

  let response: Response;
  try {
    response = await fetch(`${FASHN_BASE_URL}/status/${predictionId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(FASHN_REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new FashnApiError("fashn.ai status request timed out or failed to connect");
  }

  if (!response.ok) {
    throw new FashnApiError(`fashn.ai status request failed with status ${response.status}`, response.status);
  }

  const rawBody = await parseProviderJson(response);
  const parsed = fashnStatusResponseSchema.safeParse(rawBody);
  if (!parsed.success) {
    throw new FashnContractError("fashn.ai status response did not match the documented shape");
  }
  const body = parsed.data;

  if (body.status === "completed") {
    const outputUrl = body.output?.[0];
    if (!outputUrl) {
      throw new FashnContractError("fashn.ai reported completed with no output image");
    }
    // The URL feeds straight into next/image (via the stored
    // resultImageUrl) and into the next chain step's model_image — a
    // completed status pointing somewhere other than fashn.ai's own,
    // https-only hosts is either a contract change or something worth
    // treating as suspect either way, not something to silently trust.
    if (!isAllowedFashnOutputUrl(outputUrl)) {
      throw new FashnContractError(`fashn.ai returned an output URL from an unexpected host: ${outputUrl}`);
    }
    return { status: "completed", outputUrl };
  }

  if (body.status === "failed") {
    const message = typeof body.error === "string" ? body.error : (body.error?.message ?? "Unknown fashn.ai error");
    return { status: "failed", error: message };
  }

  return { status: "processing" };
}
