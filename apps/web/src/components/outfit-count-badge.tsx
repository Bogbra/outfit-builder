"use client";

import { useOutfitStore } from "@/features/outfit-builder/store/outfit-store";

// Isolated client island so the rest of SiteHeader (rendered on every page)
// can stay a Server Component (docs/performance-review.md).
export function OutfitCountBadge() {
  const itemCount = useOutfitStore((state) => Object.keys(state.items).length);

  return (
    <>
      {itemCount > 0 && (
        <span
          className="inline-flex min-w-6 items-center justify-center rounded-full bg-primary px-2 py-0.5 text-base font-medium text-primary-foreground"
          aria-hidden="true"
        >
          {itemCount}
        </span>
      )}
      <span className="sr-only">
        {itemCount > 0 ? `, ${itemCount} ${itemCount === 1 ? "item" : "items"} selected` : ", no items selected"}
      </span>
    </>
  );
}
