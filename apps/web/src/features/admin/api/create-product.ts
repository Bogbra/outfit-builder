import type { AdminProductFormInput } from "@outfit-builder/contracts";

import { CSRF_HEADER } from "./csrf";
import { readCsrfCookie } from "./read-csrf-cookie";

interface ApiErrorResponse {
  error?: string;
}

// Client Components cannot read the httpOnly admin_session cookie, so this
// goes through this app's own Route Handler (BFF), which forwards it as a
// Bearer token to apps/api — never calls apps/api directly from the browser.
export async function createProduct(input: AdminProductFormInput): Promise<{ id: string }> {
  const response = await fetch("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json", [CSRF_HEADER]: readCsrfCookie() ?? "" },
    body: JSON.stringify(input),
  });

  const json = (await response.json().catch(() => null)) as ({ id: string } & ApiErrorResponse) | null;

  if (!response.ok) {
    throw new Error(json?.error ?? "Failed to create product");
  }

  return json as { id: string };
}
