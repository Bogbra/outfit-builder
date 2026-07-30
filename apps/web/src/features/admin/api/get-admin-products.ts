import type { Availability, Category } from "@outfit-builder/contracts";

import { adminFetchJson } from "./admin-fetch";

export type AdminProductSortField = "name" | "price" | "createdAt";
export type SortDirection = "asc" | "desc";

export interface AdminProductListParams {
  search?: string;
  sortBy: AdminProductSortField;
  sortDirection: SortDirection;
  page: number;
}

// Mirrors the contracts `Product` schema, but createdAt/updatedAt stay as
// the ISO strings the REST API actually serializes over JSON — the Zod
// schema's `z.coerce.date()` only applies when data is parsed through it,
// which raw `response.json()` here does not do.
export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: Category;
  price: number;
  currency: string;
  images: string[];
  colors: string[];
  sizes: string[];
  styleTags: string[];
  material: string;
  availability: Availability;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductPage {
  items: AdminProduct[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getAdminProducts(params: AdminProductListParams): Promise<AdminProductPage> {
  const query = new URLSearchParams({
    sortBy: params.sortBy,
    sortDirection: params.sortDirection,
    page: String(params.page),
  });
  if (params.search) {
    query.set("search", params.search);
  }

  return adminFetchJson<AdminProductPage>(`/api/admin/products?${query.toString()}`);
}

export async function getAdminProduct(id: string): Promise<AdminProduct> {
  return adminFetchJson<AdminProduct>(`/api/admin/products/${id}`);
}
