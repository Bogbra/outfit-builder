import type { Category } from "@outfit-builder/contracts";

import { env } from "@/lib/env";

import { extractErrorMessage, OutfitApiError } from "./outfit-api-error";
import type { SavedOutfit } from "./types";

export interface SaveOutfitItemInput {
  productId: string;
  category: Category;
  selectedColor: string;
  selectedSize: string;
}

export interface SaveOutfitInput {
  name: string;
  items: SaveOutfitItemInput[];
}

// Runs client-side (the outfit builder page is a Client Component), so it
// must use the NEXT_PUBLIC_ API URL — see apps/web/src/lib/env.ts.
export async function saveOutfit(input: SaveOutfitInput): Promise<SavedOutfit> {
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/outfits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new OutfitApiError(await extractErrorMessage(response, "Failed to save outfit"), response.status);
  }

  return response.json();
}
