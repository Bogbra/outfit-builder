import { categorySchema, type Category } from "@outfit-builder/contracts";

import type { CatalogFilters } from "../api/get-products";

export type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseCategory(value: string | undefined): Category | undefined {
  if (!value) return undefined;
  const result = categorySchema.safeParse(value);
  return result.success ? result.data : undefined;
}

function parseNonNegativeNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parsePositiveInt(value: string | undefined): number | undefined {
  const parsed = parseNonNegativeNumber(value);
  return parsed !== undefined && Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export function parseCatalogSearchParams(searchParams: RawSearchParams): CatalogFilters {
  return {
    category: parseCategory(firstValue(searchParams.category)),
    color: firstValue(searchParams.color) || undefined,
    size: firstValue(searchParams.size) || undefined,
    style: firstValue(searchParams.style) || undefined,
    minPrice: parseNonNegativeNumber(firstValue(searchParams.minPrice)),
    maxPrice: parseNonNegativeNumber(firstValue(searchParams.maxPrice)),
    search: firstValue(searchParams.search) || undefined,
    page: parsePositiveInt(firstValue(searchParams.page)),
  };
}
