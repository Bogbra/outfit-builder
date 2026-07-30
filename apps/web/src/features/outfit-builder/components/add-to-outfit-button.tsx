"use client";

import { Button } from "@outfit-builder/ui";

import type { CatalogProduct } from "@/features/catalog/api/get-products";

import { useOutfitStore } from "../store/outfit-store";

export interface AddToOutfitButtonProps {
  product: CatalogProduct;
}

// The interactive slice of ProductCard — kept as its own client island so
// the rest of the card can stay a Server Component (docs/08-performance.md
// "use client components only for interactive features").
export function AddToOutfitButton({ product }: AddToOutfitButtonProps) {
  const currentItem = useOutfitStore((state) => state.items[product.category]);
  const addItem = useOutfitStore((state) => state.addItem);
  const removeItem = useOutfitStore((state) => state.removeItem);

  const isSelected = currentItem?.product.id === product.id;

  if (isSelected) {
    return (
      <Button variant="secondary" className="w-full" onClick={() => removeItem(product.category)}>
        Remove from outfit
      </Button>
    );
  }

  return (
    <Button variant="primary" className="w-full" onClick={() => addItem(product)}>
      {currentItem ? "Replace in outfit" : "Add to outfit"}
    </Button>
  );
}
