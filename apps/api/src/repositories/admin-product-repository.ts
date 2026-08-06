import { Prisma } from "@prisma/client";
import type { AdminProductFormInput, AdminProductUpdateInput, Product } from "@outfit-builder/contracts";

import { prisma } from "../lib/prisma.js";

export type ProductSortField = "name" | "priceMinor" | "createdAt";
export type SortDirection = "asc" | "desc";

export interface AdminProductListParams {
  search?: string;
  sortBy: ProductSortField;
  sortDirection: SortDirection;
  page: number;
  pageSize: number;
}

export interface AdminProductPage {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

// Unlike the public catalog repository, this intentionally does NOT filter
// by isActive — admins need to see and manage inactive products too.
export async function listAdminProducts(params: AdminProductListParams): Promise<AdminProductPage> {
  const where: Prisma.ProductWhereInput = params.search
    ? {
        OR: [
          { name: { contains: params.search, mode: "insensitive" } },
          { description: { contains: params.search, mode: "insensitive" } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { [params.sortBy]: params.sortDirection },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page: params.page, pageSize: params.pageSize };
}

export async function getAdminProductById(id: string): Promise<Product | null> {
  return prisma.product.findUnique({ where: { id } });
}

export class DuplicateSlugError extends Error {
  constructor(slug: string) {
    super(`A product with the slug "${slug}" already exists`);
    this.name = "DuplicateSlugError";
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function createProduct(input: AdminProductFormInput): Promise<Product> {
  try {
    return await prisma.product.create({ data: input });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new DuplicateSlugError(input.slug);
    }
    throw error;
  }
}

export async function updateProduct(id: string, input: AdminProductUpdateInput): Promise<Product | null> {
  try {
    return await prisma.product.update({ where: { id }, data: input });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return null;
    }
    if (isUniqueConstraintError(error)) {
      throw new DuplicateSlugError(input.slug ?? id);
    }
    throw error;
  }
}
