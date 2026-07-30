import type { Category } from "@outfit-builder/contracts";
import { create } from "zustand";

import type { CatalogProduct } from "@/features/catalog/api/get-products";

export interface OutfitStoreItem {
  product: CatalogProduct;
  selectedColor: string;
  selectedSize: string;
}

export interface OutfitState {
  items: Partial<Record<Category, OutfitStoreItem>>;
  addItem: (product: CatalogProduct) => void;
  removeItem: (category: Category) => void;
  clear: () => void;
}

// One item per category — adding a product to an already-filled category
// replaces it, matching packages/contracts' createOutfitInputSchema rule
// (only one item per category is allowed).
export const useOutfitStore = create<OutfitState>((set) => ({
  items: {},

  addItem: (product) =>
    set((state) => ({
      items: {
        ...state.items,
        [product.category]: {
          product,
          selectedColor: product.colors[0] ?? "",
          selectedSize: product.sizes[0] ?? "",
        },
      },
    })),

  removeItem: (category) =>
    set((state) => {
      if (!(category in state.items)) {
        return state;
      }
      const nextItems = { ...state.items };
      delete nextItems[category];
      return { items: nextItems };
    }),

  clear: () => set({ items: {} }),
}));
