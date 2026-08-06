import { Card, CardContent, CardHeader, CardTitle } from "@outfit-builder/ui";

import { formatPrice } from "@/lib/format-price";

import type { AdminAnalytics } from "../api/get-analytics";

export interface AnalyticsCardsProps {
  analytics: AdminAnalytics;
}

// averageOutfitPriceMinor has no currency of its own — formatted as EUR
// since the catalog is single-currency for this MVP.
export function AnalyticsCards({ analytics }: AnalyticsCardsProps) {
  const cards: { label: string; value: string; capitalize?: boolean }[] = [
    { label: "Total products", value: String(analytics.totalProducts) },
    { label: "Saved outfits", value: String(analytics.totalSavedOutfits) },
    { label: "Most used category", value: analytics.mostUsedCategory ?? "—", capitalize: true },
    {
      label: "Average outfit price",
      value:
        analytics.averageOutfitPriceMinor !== null ? formatPrice(analytics.averageOutfitPriceMinor, "EUR") : "—",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-4">
          <CardHeader className="gap-1 p-0 pb-2">
            <CardTitle as="h2" className="text-base font-medium text-muted-foreground">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent
            className={`p-0 font-heading text-2xl font-semibold text-foreground ${card.capitalize ? "capitalize" : ""}`}
          >
            {card.value}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
