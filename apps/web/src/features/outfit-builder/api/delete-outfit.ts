import { env } from "@/lib/env";

import { extractErrorMessage, OutfitApiError } from "./outfit-api-error";

export async function deleteOutfit(id: string): Promise<void> {
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/outfits/${id}`, {
    method: "DELETE",
  });

  if (!response.ok && response.status !== 404) {
    throw new OutfitApiError(
      await extractErrorMessage(response, "Failed to delete outfit"),
      response.status,
    );
  }
}
