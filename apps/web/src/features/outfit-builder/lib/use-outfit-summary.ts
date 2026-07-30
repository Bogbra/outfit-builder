import {
  calculateOutfitTotalPrice,
  getCompatibilityWarnings,
  validateOutfitCompleteness,
  type CompatibilityWarning,
  type OutfitCompletenessResult,
  type OutfitPrice,
} from "@outfit-builder/contracts";

import { useOutfitStore, type OutfitStoreItem } from "../store/outfit-store";

export interface OutfitSummary {
  items: OutfitStoreItem[];
  price: OutfitPrice;
  completeness: OutfitCompletenessResult;
  warnings: CompatibilityWarning[];
}

// Derives price/completeness/compatibility from the store using the pure
// business logic in packages/contracts — no rules live in this component
// tree, only wiring (docs/02-architecture.md).
export function useOutfitSummary(): OutfitSummary {
  const itemsByCategory = useOutfitStore((state) => state.items);
  const items = Object.values(itemsByCategory).filter(
    (item): item is OutfitStoreItem => item !== undefined,
  );

  const price = calculateOutfitTotalPrice(items.map((entry) => ({ product: entry.product })));
  const completeness = validateOutfitCompleteness(
    items.map((entry) => ({ category: entry.product.category })),
  );
  const warnings = getCompatibilityWarnings(
    items.map((entry) => ({
      item: { selectedColor: entry.selectedColor },
      product: { styleTags: entry.product.styleTags },
    })),
  );

  return { items, price, completeness, warnings };
}
