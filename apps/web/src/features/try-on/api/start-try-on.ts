import type { Category, TryOnResponse } from "@outfit-builder/contracts";

import { env } from "@/lib/env";

import { extractErrorMessage, TryOnApiError } from "./try-on-api-error";

export interface StartTryOnInput {
  photo: string; // base64 data URL
  items: Array<{ productId: string; category: Category }>;
}

// Runs client-side (triggered from the outfit builder, a Client Component),
// so it calls apps/api directly with NEXT_PUBLIC_API_URL — same pattern as
// save-outfit.ts. FASHN_API_KEY never leaves apps/api regardless of who
// calls this endpoint, so no proxy Route Handler is needed here.
export async function startTryOn(input: StartTryOnInput): Promise<TryOnResponse> {
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/try-on`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new TryOnApiError(await extractErrorMessage(response, "Failed to start virtual try-on"), response.status);
  }

  return response.json();
}
