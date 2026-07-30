import type { Prisma } from "@prisma/client";
import type { Product, ProductFilters } from "@outfit-builder/contracts";

import { prisma } from "../lib/prisma.js";

// Pure — builds the Prisma where-clause from validated filters. No DB
// access, so it is fully unit-testable on its own.
export function buildProductWhereClause(filters: ProductFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (filters.category) {
    where.category = filters.category;
  }
  if (filters.color) {
    where.colors = { has: filters.color };
  }
  if (filters.size) {
    where.sizes = { has: filters.size };
  }
  if (filters.style) {
    where.styleTags = { has: filters.style };
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listProducts(filters: ProductFilters): Promise<ProductPage> {
  const where = buildProductWhereClause(filters);

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page: filters.page, pageSize: filters.pageSize };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return prisma.product.findFirst({ where: { slug, isActive: true } });
}

export interface FilterOptions {
  colors: string[];
  sizes: string[];
  styleTags: string[];
}

// Aggregated in JS rather than SQL — fine at seed-catalog scale (dozens of
// products). Revisit with a raw `unnest()` query if the catalog grows large
// enough for this to matter.
export async function getFilterOptions(): Promise<FilterOptions> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { colors: true, sizes: true, styleTags: true },
  });

  const colors = new Set<string>();
  const sizes = new Set<string>();
  const styleTags = new Set<string>();

  for (const product of products) {
    for (const color of product.colors) colors.add(color);
    for (const size of product.sizes) sizes.add(size);
    for (const tag of product.styleTags) styleTags.add(tag);
  }

  return {
    colors: [...colors].sort(),
    sizes: [...sizes].sort(),
    styleTags: [...styleTags].sort(),
  };
}
