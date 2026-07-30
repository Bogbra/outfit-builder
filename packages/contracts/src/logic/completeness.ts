import { REQUIRED_CATEGORIES, type Category } from "../domain/category.js";
import type { OutfitItem } from "../domain/outfit-item.js";

export interface OutfitCompletenessResult {
  isComplete: boolean;
  missingRequiredCategories: Category[];
}

export function validateOutfitCompleteness(
  items: readonly Pick<OutfitItem, "category">[],
): OutfitCompletenessResult {
  const selectedCategories = new Set(items.map((item) => item.category));
  const missingRequiredCategories = REQUIRED_CATEGORIES.filter(
    (category) => !selectedCategories.has(category),
  );

  return {
    isComplete: missingRequiredCategories.length === 0,
    missingRequiredCategories,
  };
}
