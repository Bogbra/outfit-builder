import { Badge, Card, CardContent, CardFooter, CardHeader, CardTitle } from "@outfit-builder/ui";
import Image from "next/image";

import { AddToOutfitButton } from "@/features/outfit-builder/components/add-to-outfit-button";
import { AVAILABILITY_LABEL, AVAILABILITY_VARIANT } from "@/lib/availability-labels";
import { formatPrice } from "@/lib/format-price";

import type { CatalogProduct } from "../api/get-products";

export interface ProductCardProps {
  product: CatalogProduct;
  // Set for cards in the first grid row so Next/Image preloads and skips
  // lazy-loading for the likely LCP element (docs/performance-review.md).
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [primaryImage] = product.images;

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow duration-200 hover:shadow-editorial-md">
      <div className="relative aspect-4/5 w-full bg-background">
        {primaryImage && (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            priority={priority}
          />
        )}
      </div>
      <CardHeader className="gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          {/* h2: the page's only <h1> is "Shop the catalog" above the grid,
              so each card title is the next heading level down — no h2
              elsewhere on this page to nest under (docs/accessibility-review.md). */}
          <CardTitle as="h2" className="text-lg">
            {product.name}
          </CardTitle>
          <Badge variant={AVAILABILITY_VARIANT[product.availability]}>
            {AVAILABILITY_LABEL[product.availability]}
          </Badge>
        </div>
        <p className="text-base font-medium text-foreground">{formatPrice(product.price, product.currency)}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 p-4 pt-0 text-base text-muted-foreground">
        <p className="capitalize">{product.category}</p>
        <p>Colors: {product.colors.join(", ")}</p>
        <p>Sizes: {product.sizes.join(", ")}</p>
      </CardContent>
      <CardFooter className="mt-auto p-4 pt-0">
        <AddToOutfitButton product={product} />
      </CardFooter>
    </Card>
  );
}
