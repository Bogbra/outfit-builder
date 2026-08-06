import { Prisma } from "@prisma/client";
import {
  calculateOutfitTotalPrice,
  validateOutfitCompleteness,
  type CreateOutfitInput,
} from "@outfit-builder/contracts";

import { prisma } from "../lib/prisma.js";

export class ProductNotFoundError extends Error {
  constructor(public readonly productId: string) {
    super(`Product ${productId} not found or inactive`);
    this.name = "ProductNotFoundError";
  }
}

export class InvalidVariantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidVariantError";
  }
}

const outfitWithItemsArgs = {
  include: { items: { include: { product: true } } },
} satisfies Prisma.OutfitDefaultArgs;

export type OutfitWithItems = Prisma.OutfitGetPayload<typeof outfitWithItemsArgs>;

// Recomputes price, completeness and style tags from the *current* product
// data server-side — the client only ever sends productId/category/
// selectedColor/selectedSize, never a price.
export async function createOutfit(input: CreateOutfitInput): Promise<OutfitWithItems> {
  const productIds = input.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });
  const productById = new Map(products.map((product) => [product.id, product]));

  const itemsWithProduct = input.items.map((item) => {
    const product = productById.get(item.productId);
    if (!product) {
      throw new ProductNotFoundError(item.productId);
    }
    if (product.category !== item.category) {
      throw new InvalidVariantError(
        `${product.name} belongs to category ${product.category}, not ${item.category}`,
      );
    }
    if (!product.colors.includes(item.selectedColor)) {
      throw new InvalidVariantError(`"${item.selectedColor}" is not an available color for ${product.name}`);
    }
    if (!product.sizes.includes(item.selectedSize)) {
      throw new InvalidVariantError(`"${item.selectedSize}" is not an available size for ${product.name}`);
    }
    return { item, product };
  });

  const { totalPriceMinor, currency } = calculateOutfitTotalPrice(
    itemsWithProduct.map(({ product }) => ({ product })),
  );
  const { isComplete } = validateOutfitCompleteness(
    itemsWithProduct.map(({ item }) => ({ category: item.category })),
  );
  const styleTags = [...new Set(itemsWithProduct.flatMap(({ product }) => product.styleTags))];

  return prisma.outfit.create({
    data: {
      name: input.name,
      totalPriceMinor,
      currency,
      styleTags,
      validationStatus: isComplete ? "complete" : "incomplete",
      items: {
        create: itemsWithProduct.map(({ item }) => ({
          productId: item.productId,
          category: item.category,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
        })),
      },
    },
    ...outfitWithItemsArgs,
  });
}

export interface OutfitPage {
  items: OutfitWithItems[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listOutfits(page: number, pageSize: number): Promise<OutfitPage> {
  const [items, total] = await Promise.all([
    prisma.outfit.findMany({
      ...outfitWithItemsArgs,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.outfit.count(),
  ]);

  return { items, total, page, pageSize };
}

export async function getOutfitById(id: string): Promise<OutfitWithItems | null> {
  return prisma.outfit.findUnique({ where: { id }, ...outfitWithItemsArgs });
}

export async function deleteOutfit(id: string): Promise<boolean> {
  try {
    await prisma.outfit.delete({ where: { id } });
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return false;
    }
    throw error;
  }
}
