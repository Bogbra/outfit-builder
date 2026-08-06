import { adminProductUpdateSchema } from "@outfit-builder/contracts";
import { NextResponse } from "next/server";
import { z } from "zod";

import { adminFetch } from "@/features/admin/api/admin-fetch";
import { verifyCsrf } from "@/features/admin/api/verify-csrf";

const idParamSchema = z.object({ id: z.string().uuid() });

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await verifyCsrf(request))) {
    return NextResponse.json({ error: "Invalid or missing CSRF token" }, { status: 403 });
  }

  const parsedParams = idParamSchema.safeParse(await context.params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 422 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = adminProductUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product data" }, { status: 422 });
  }

  const apiResponse = await adminFetch(`/api/admin/products/${parsedParams.data.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  const json: unknown = await apiResponse.json().catch(() => null);
  return NextResponse.json(json, { status: apiResponse.status });
}
