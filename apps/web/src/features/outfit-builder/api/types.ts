import type { Availability, Category } from "@outfit-builder/contracts";

export interface SavedOutfitItem {
  id: string;
  category: Category;
  selectedColor: string;
  selectedSize: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    currency: string;
    images: string[];
    availability: Availability;
  };
}

export interface SavedOutfit {
  id: string;
  name: string;
  totalPrice: number;
  currency: string | null;
  styleTags: string[];
  validationStatus: "complete" | "incomplete";
  items: SavedOutfitItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedOutfitPage {
  items: SavedOutfit[];
  total: number;
  page: number;
  pageSize: number;
}
