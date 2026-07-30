import type { AdminProductFormInput } from "@outfit-builder/contracts";

import { CSRF_HEADER } from "./csrf";
import { readCsrfCookie } from "./read-csrf-cookie";

interface ApiErrorResponse {
  error?: string;
}

export async function updateProduct(id: string, input: AdminProductFormInput): Promise<{ id: string }> {
  const response = await fetch(`/api/admin/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", [CSRF_HEADER]: readCsrfCookie() ?? "" },
    body: JSON.stringify(input),
  });

  const json = (await response.json().catch(() => null)) as ({ id: string } & ApiErrorResponse) | null;

  if (!response.ok) {
    throw new Error(json?.error ?? "Failed to update product");
  }

  return json as { id: string };
}
