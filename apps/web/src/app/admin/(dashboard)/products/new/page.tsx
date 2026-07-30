import { AdminProductForm } from "@/features/admin/components/admin-product-form";

// See apps/web/src/app/admin/login/page.tsx for why — same static-page +
// nonce-based-CSP issue.
export const dynamic = "force-dynamic";

export default function NewAdminProductPage() {
  return (
    <main className="mx-auto flex w-full max-w-screen-lg flex-1 flex-col gap-8 px-4 py-8 sm:px-6 md:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold text-foreground">New product</h1>
        <p className="max-w-prose text-base text-muted-foreground">Add a new item to the catalog.</p>
      </header>
      <AdminProductForm mode="create" />
    </main>
  );
}
