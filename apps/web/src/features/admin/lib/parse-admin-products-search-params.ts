import type { AdminProductListParams, AdminProductSortField, SortDirection } from "../api/get-admin-products";

export type RawSearchParams = Record<string, string | string[] | undefined>;

const SORT_FIELDS: AdminProductSortField[] = ["name", "priceMinor", "createdAt"];
const SORT_DIRECTIONS: SortDirection[] = ["asc", "desc"];

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseSortBy(value: string | undefined): AdminProductSortField {
  return SORT_FIELDS.includes(value as AdminProductSortField) ? (value as AdminProductSortField) : "createdAt";
}

function parseSortDirection(value: string | undefined): SortDirection {
  return SORT_DIRECTIONS.includes(value as SortDirection) ? (value as SortDirection) : "desc";
}

function parsePositiveInt(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function parseAdminProductsSearchParams(searchParams: RawSearchParams): AdminProductListParams {
  return {
    search: firstValue(searchParams.search) || undefined,
    sortBy: parseSortBy(firstValue(searchParams.sortBy)),
    sortDirection: parseSortDirection(firstValue(searchParams.sortDirection)),
    page: parsePositiveInt(firstValue(searchParams.page)),
  };
}
