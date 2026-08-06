"use client";

import type { Category } from "@outfit-builder/contracts";
import { Button } from "@outfit-builder/ui";
import Image from "next/image";

import { formatPrice } from "@/lib/format-price";

import { CATEGORY_LABEL } from "../lib/category-labels";
import { useOutfitStore, type OutfitStoreItem } from "../store/outfit-store";

export interface OutfitSlotProps {
  category: Category;
  required: boolean;
  item: OutfitStoreItem | undefined;
}

export function OutfitSlot({ category, required, item }: OutfitSlotProps) {
  const removeItem = useOutfitStore((state) => state.removeItem);
  const label = CATEGORY_LABEL[category];

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-medium text-foreground">
          {label}
          {required && (
            <>
              <span className="text-error" aria-hidden="true">
                {" "}
                *
              </span>
              <span className="sr-only"> (required)</span>
            </>
          )}
        </p>
        {!required && <span className="text-base text-muted-foreground">Optional</span>}
      </div>

      {item ? (
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square w-full overflow-hidden rounded-md bg-background">
            {item.product.images[0] && (
              <Image
                src={item.product.images[0]}
                alt={item.product.name}
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-base font-medium text-foreground">{item.product.name}</p>
            <p className="text-base text-muted-foreground">
              {item.selectedColor}, {item.selectedSize}
            </p>
            <p className="text-base text-foreground">
              {formatPrice(item.product.priceMinor, item.product.currency)}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => removeItem(category)}
            aria-label={`Remove ${item.product.name} from outfit`}
          >
            Remove
          </Button>
        </div>
      ) : (
        <p className="flex flex-1 items-center justify-center rounded-md border border-dashed border-border-strong px-4 py-10 text-center text-base text-muted-foreground">
          No {label.toLowerCase()} selected
        </p>
      )}
    </div>
  );
}
