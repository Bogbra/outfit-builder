import { LoadingSkeleton } from "@outfit-builder/ui";

// Covers the dashboard, product list and product edit/create pages — the
// persistent admin nav (layout.tsx) stays mounted outside this boundary, so
// a single generic content skeleton is enough rather than one per page.
export default function AdminSectionLoading() {
  return (
    <main className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 md:px-8">
      <div className="flex flex-col gap-2">
        <LoadingSkeleton className="h-9 w-64" />
        <LoadingSkeleton className="h-6 w-96 max-w-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <LoadingSkeleton key={index} className="h-24 w-full" />
        ))}
      </div>

      <LoadingSkeleton className="h-64 w-full" />
    </main>
  );
}
