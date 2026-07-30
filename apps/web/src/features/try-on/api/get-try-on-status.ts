import type { TryOnResponse } from "@outfit-builder/contracts";

import { env } from "@/lib/env";

import { extractErrorMessage, TryOnApiError } from "./try-on-api-error";

export async function getTryOnStatus(id: string): Promise<TryOnResponse> {
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/try-on/${id}`, { cache: "no-store" });

  if (!response.ok) {
    throw new TryOnApiError(await extractErrorMessage(response, "Failed to check try-on status"), response.status);
  }

  return response.json();
}
