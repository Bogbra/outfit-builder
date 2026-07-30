import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { adminFetch } from "@/features/admin/api/admin-fetch";
import { CSRF_COOKIE } from "@/features/admin/api/csrf";

// Revokes the session server-side first — clearing the cookie alone leaves
// the JWT itself valid (and usable by anyone who captured it) until its 8h
// expiry. Best-effort: a failure here (e.g. apps/api unreachable) shouldn't
// strand the user unable to clear their own browser cookie.
export async function POST() {
  await adminFetch("/api/auth/logout", { method: "POST" }).catch(() => null);

  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  cookieStore.delete(CSRF_COOKIE);
  return NextResponse.json({ success: true });
}
