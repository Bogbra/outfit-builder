import { AdminLoginForm } from "@/features/admin/components/admin-login-form";

// A Server Component page.tsx (not "use client") is required for
// `force-dynamic` to actually prevent static prerendering — Next.js
// doesn't reliably honor the export on a page whose default export is
// itself a Client Component. Needed here because a statically prerendered
// page's HTML has no per-request nonce, which the nonce-based CSP in
// proxy.ts would then block on a hard load/refresh.
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-screen-sm flex-1 flex-col justify-center gap-8 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold text-foreground">Admin login</h1>
        <p className="text-base text-muted-foreground">Sign in to manage products and view analytics.</p>
      </div>

      <AdminLoginForm />
    </main>
  );
}
