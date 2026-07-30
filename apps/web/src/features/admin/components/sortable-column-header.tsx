import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import Link from "next/link";

import type { AdminProductSortField, SortDirection } from "../api/get-admin-products";
import type { RawSearchParams } from "../lib/parse-admin-products-search-params";

export interface SortableColumnHeaderProps {
  label: string;
  field: AdminProductSortField;
  currentSortBy: AdminProductSortField;
  currentSortDirection: SortDirection;
  rawSearchParams: RawSearchParams;
}

function buildHref(field: AdminProductSortField, nextDirection: SortDirection, rawSearchParams: RawSearchParams) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(rawSearchParams)) {
    if (typeof value === "string" && key !== "page" && key !== "sortBy" && key !== "sortDirection") {
      params.set(key, value);
    }
  }
  params.set("sortBy", field);
  params.set("sortDirection", nextDirection);
  return `/admin/products?${params.toString()}`;
}

export function SortableColumnHeader({
  label,
  field,
  currentSortBy,
  currentSortDirection,
  rawSearchParams,
}: SortableColumnHeaderProps) {
  const isActive = currentSortBy === field;
  const nextDirection: SortDirection = isActive && currentSortDirection === "asc" ? "desc" : "asc";
  const Icon = isActive ? (currentSortDirection === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <th scope="col" aria-sort={isActive ? (currentSortDirection === "asc" ? "ascending" : "descending") : "none"}>
      <Link
        href={buildHref(field, nextDirection, rawSearchParams)}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-base font-medium text-foreground transition-colors duration-200 hover:text-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {label}
        <Icon className="size-4" aria-hidden="true" />
      </Link>
    </th>
  );
}
