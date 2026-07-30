import { prisma } from "../lib/prisma.js";

export interface AdminAnalytics {
  totalProducts: number;
  totalSavedOutfits: number;
  mostUsedCategory: string | null;
  averageOutfitPrice: number | null;
}

// Computed live — acceptable at MVP scale (dozens of rows). Revisit with
// cached/precomputed values if the catalog/outfit tables grow large enough
// for this to matter (docs/09-scalability.md).
export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const [totalProducts, totalSavedOutfits, categoryGroups, priceAggregate] = await Promise.all([
    prisma.product.count(),
    prisma.outfit.count(),
    prisma.outfitItem.groupBy({
      by: ["category"],
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
      take: 1,
    }),
    prisma.outfit.aggregate({ _avg: { totalPrice: true } }),
  ]);

  return {
    totalProducts,
    totalSavedOutfits,
    mostUsedCategory: categoryGroups[0]?.category ?? null,
    averageOutfitPrice: priceAggregate._avg.totalPrice,
  };
}
