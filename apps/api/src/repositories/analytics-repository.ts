import { prisma } from "../lib/prisma.js";

export interface AdminAnalytics {
  totalProducts: number;
  totalSavedOutfits: number;
  mostUsedCategory: string | null;
  averageOutfitPriceMinor: number | null;
}

// Computed live — acceptable at MVP scale (dozens of rows). Revisit with
// cached/precomputed values if the catalog/outfit tables grow large enough
// for this to matter.
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
    prisma.outfit.aggregate({ _avg: { totalPriceMinor: true } }),
  ]);

  const averageOutfitPriceMinor = priceAggregate._avg.totalPriceMinor;

  return {
    totalProducts,
    totalSavedOutfits,
    mostUsedCategory: categoryGroups[0]?.category ?? null,
    // Prisma's _avg is a float even over an Int column (e.g. 6233.33) —
    // rounded because a fractional cent isn't meaningful.
    averageOutfitPriceMinor: averageOutfitPriceMinor === null ? null : Math.round(averageOutfitPriceMinor),
  };
}
