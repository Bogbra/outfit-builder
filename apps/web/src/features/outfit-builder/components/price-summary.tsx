import type { OutfitPrice } from "@outfit-builder/contracts";

import { formatPrice } from "@/lib/format-price";

export interface PriceSummaryProps {
  price: OutfitPrice;
}

export function PriceSummary({ price }: PriceSummaryProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex w-full items-center justify-between rounded-lg border border-border bg-surface p-4"
    >
      <p className="text-base font-medium text-foreground">Total price</p>
      <p className="font-heading text-xl font-semibold text-foreground">
        {price.currency ? formatPrice(price.totalPrice, price.currency) : "—"}
      </p>
    </div>
  );
}
