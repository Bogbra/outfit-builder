import { DesignSystemView } from "./design-system-view";

// See apps/web/src/app/admin/login/page.tsx for why — same static-page +
// nonce-based-CSP issue.
export const dynamic = "force-dynamic";

export default function DesignSystemPage() {
  return (
    <main className="mx-auto flex w-full max-w-screen-lg flex-col gap-4 px-4 py-8 sm:px-6 md:px-8">
      <h1 className="font-heading text-3xl font-semibold text-foreground">Design System</h1>
      <p className="max-w-prose text-base text-muted-foreground">
        Live examples of the shared UI primitives in <code>packages/ui</code>, each shown in its
        default, interactive and — where applicable — error state.
      </p>

      <DesignSystemView />
    </main>
  );
}
