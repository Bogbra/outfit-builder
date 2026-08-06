import type { CatalogProduct } from "../api/get-products";
import { ProductCard } from "./product-card";

export interface ProductGridProps {
  products: CatalogProduct[];
}

// First-row card count at the widest supported breakpoint (xl:grid-cols-4)
// — these get `priority` since they're the likely LCP element.
const PRIORITY_COUNT = 4;

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} priority={index < PRIORITY_COUNT} />
        </li>
      ))}
    </ul>
  );
}
