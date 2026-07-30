import { env } from "./env.js";

// The only outbound third-party API call in this codebase — isolated here
// so try-on-repository.ts never talks to fashn.ai directly, and so tests
// can mock this one module instead of stubbing global fetch. See
// docs/07-security.md "Virtual try-on".
const FASHN_BASE_URL = "https://api.fashn.ai/v1";

export class FashnApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FashnApiError";
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

interface StartTryOnStepInput {
  modelImage: string;
  garmentImage: string;
}

export async function startTryOnStep({ modelImage, garmentImage }: StartTryOnStepInput): Promise<string> {
  const apiKey = requireApiKey();

  const response = await fetch(`${FASHN_BASE_URL}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model_name: "tryon-v1.6",
      inputs: {
        model_image: modelImage,
        garment_image: garmentImage,
        category: "auto",
        // Public, unauthenticated, user-content endpoint — deliberately
        // stricter than fashn's own "permissive" default.
        moderation_level: "conservative",
      },
    }),
  });

  if (!response.ok) {
    throw new FashnApiError(`fashn.ai run request failed with status ${response.status}`);
  }

  const body: unknown = await response.json();
  if (typeof body !== "object" || body === null || typeof (body as { id?: unknown }).id !== "string") {
    throw new FashnApiError("fashn.ai run response did not include a prediction id");
  }

  return (body as { id: string }).id;
}

export type FashnStepStatus =
  | { status: "processing" }
  | { status: "completed"; outputUrl: string }
  | { status: "failed"; error: string };

export async function getTryOnStepStatus(predictionId: string): Promise<FashnStepStatus> {
  const apiKey = requireApiKey();

  const response = await fetch(`${FASHN_BASE_URL}/status/${predictionId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    throw new FashnApiError(`fashn.ai status request failed with status ${response.status}`);
  }

  const body = (await response.json()) as {
    status?: string;
    output?: string[];
    error?: { message?: string } | string | null;
  };

  if (body.status === "completed") {
    const outputUrl = body.output?.[0];
    if (!outputUrl) {
      throw new FashnApiError("fashn.ai reported completed with no output image");
    }
    return { status: "completed", outputUrl };
  }

  if (body.status === "failed") {
    const message = typeof body.error === "string" ? body.error : (body.error?.message ?? "Unknown fashn.ai error");
    return { status: "failed", error: message };
  }

  return { status: "processing" };
}
