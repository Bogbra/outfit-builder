import { Badge, Card, CardTitle } from "@outfit-builder/ui";
import Image from "next/image";

import { formatPrice } from "@/lib/format-price";

import type { SavedOutfit } from "../api/types";
import { DeleteOutfitButton } from "./delete-outfit-button";

export interface SavedOutfitCardProps {
  outfit: SavedOutfit;
}

export function SavedOutfitCard({ outfit }: SavedOutfitCardProps) {
  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-2">
        {/* h2, same reasoning as ProductCard — the page's only <h1> is
            "Saved outfits", nothing else on the page needs an h2. */}
        <CardTitle as="h2" className="text-lg">
          {outfit.name}
        </CardTitle>
        <Badge variant={outfit.validationStatus === "complete" ? "success" : "warning"}>
          {outfit.validationStatus === "complete" ? "Complete" : "Incomplete"}
        </Badge>
      </div>

      <div className="flex gap-2">
        {outfit.items.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square w-16 shrink-0 overflow-hidden rounded-md bg-background"
          >
            {item.product.images[0] && (
              <Image
                src={item.product.images[0]}
                alt={item.product.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            )}
          </div>
        ))}
      </div>

      <p className="text-base font-medium text-foreground">
        {outfit.currency ? formatPrice(outfit.totalPriceMinor, outfit.currency) : "—"}
      </p>

      <div className="mt-auto flex justify-end">
        <DeleteOutfitButton id={outfit.id} name={outfit.name} />
      </div>
    </Card>
  );
}
