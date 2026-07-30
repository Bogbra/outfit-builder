import { adminProductFormSchema } from "@outfit-builder/contracts";
import { NextResponse } from "next/server";

import { adminFetch } from "@/features/admin/api/admin-fetch";
import { verifyCsrf } from "@/features/admin/api/verify-csrf";

// BFF proxy: forwards the httpOnly session cookie to apps/api as a Bearer
// token (Client Components can't read the cookie themselves). Body is
// re-validated here too, not just trusted from the client.
export async function POST(request: Request) {
  if (!(await verifyCsrf(request))) {
    return NextResponse.json({ error: "Invalid or missing CSRF token" }, { status: 403 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = adminProductFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product data" }, { status: 422 });
  }

  const apiResponse = await adminFetch("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  const json: unknown = await apiResponse.json().catch(() => null);
  return NextResponse.json(json, { status: apiResponse.status });
}
