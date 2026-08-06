import { env } from "@/lib/env";

import type { SavedOutfitPage } from "./types";

// Runs server-side (the saved outfits page is a Server Component), so it
// uses the server-only API URL — see apps/web/src/lib/env.ts.
export async function getSavedOutfits(): Promise<SavedOutfitPage> {
  const response = await fetch(`${env.API_URL}/api/outfits`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load saved outfits (status ${response.status})`);
  }

  return response.json();
}
