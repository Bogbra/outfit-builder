import type { CompatibilityWarning } from "../domain/compatibility-rule.js";
import type { OutfitItem } from "../domain/outfit-item.js";
import type { Product } from "../domain/product.js";

export interface CompatibilityCheckItem {
  item: Pick<OutfitItem, "selectedColor">;
  product: Pick<Product, "styleTags">;
}

// Common styling guideline: more than a handful of colors in one outfit
// tends to look busy rather than intentional.
const MAX_RECOMMENDED_COLORS = 3;

export function getCompatibilityWarnings(items: readonly CompatibilityCheckItem[]): CompatibilityWarning[] {
  const warnings: CompatibilityWarning[] = [];

  if (items.length >= 2) {
    const styleTagSets = items.map((entry) => new Set(entry.product.styleTags));
    const sharedStyleTags = styleTagSets.reduce(
      (shared, tags) => new Set([...shared].filter((tag) => tags.has(tag))),
    );
    if (sharedStyleTags.size === 0) {
      warnings.push({
        type: "style-overlap",
        severity: "warning",
        message: "These items don't share a common style tag — the outfit may look mismatched.",
      });
    }
  }

  const distinctColors = new Set(items.map((entry) => entry.item.selectedColor));
  if (distinctColors.size > MAX_RECOMMENDED_COLORS) {
    warnings.push({
      type: "color-count",
      severity: "warning",
      message: `This outfit uses ${distinctColors.size} colors — consider limiting it to ${MAX_RECOMMENDED_COLORS} for a cohesive look.`,
    });
  }

  return warnings;
}
