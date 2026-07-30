import { OutfitBuilderView } from "@/features/outfit-builder/components/outfit-builder-view";

// See apps/web/src/app/admin/login/page.tsx for why — same static-page +
// nonce-based-CSP issue. This page has no data fetch of its own so Next
// would otherwise statically prerender it.
export const dynamic = "force-dynamic";

export default function OutfitBuilderPage() {
  return (
    <main className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 md:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold text-foreground">Build your outfit</h1>
        <p className="max-w-prose text-base text-muted-foreground">
          Add a top, bottom and shoes to complete your outfit. Jacket, bag and accessory are optional.
        </p>
      </header>

      <OutfitBuilderView />
    </main>
  );
}
