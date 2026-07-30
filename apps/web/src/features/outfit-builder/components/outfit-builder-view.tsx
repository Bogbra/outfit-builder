"use client";

import { OPTIONAL_CATEGORIES, REQUIRED_CATEGORIES } from "@outfit-builder/contracts";
import { Button } from "@outfit-builder/ui";

import { TryOnDialog } from "@/features/try-on/components/try-on-dialog";

import { CompatibilityWarnings } from "./compatibility-warnings";
import { CompletenessStatus } from "./completeness-status";
import { OutfitSlot } from "./outfit-slot";
import { PriceSummary } from "./price-summary";
import { SaveOutfitDialog } from "./save-outfit-dialog";
import { useOutfitSummary } from "../lib/use-outfit-summary";
import { useOutfitStore } from "../store/outfit-store";

const ALL_CATEGORIES = [...REQUIRED_CATEGORIES, ...OPTIONAL_CATEGORIES];

// Client island: everything here reads live Zustand state, so it can't be a
// Server Component. The page's static header/copy stays out of this
// boundary (apps/web/src/app/outfit-builder/page.tsx) so it isn't shipped
// as part of this component's client bundle (docs/performance-review.md).
export function OutfitBuilderView() {
  const itemsByCategory = useOutfitStore((state) => state.items);
  const clear = useOutfitStore((state) => state.clear);
  const { price, completeness, warnings, items } = useOutfitSummary();

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ALL_CATEGORIES.map((category) => (
          <OutfitSlot
            key={category}
            category={category}
            required={REQUIRED_CATEGORIES.includes(category)}
            item={itemsByCategory[category]}
          />
        ))}
      </div>

      <div className="flex flex-col items-start gap-4">
        <CompletenessStatus completeness={completeness} />
        <CompatibilityWarnings warnings={warnings} />
        <PriceSummary price={price} />

        {items.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <SaveOutfitDialog items={items} />
            <TryOnDialog items={items} />
            <Button variant="ghost" onClick={clear}>
              Clear outfit
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
