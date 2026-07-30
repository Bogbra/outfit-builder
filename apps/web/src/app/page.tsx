import { EmptyState, ErrorState, LoadingSkeleton } from "@outfit-builder/ui";
import { Suspense } from "react";

import { getFilterOptions } from "@/features/catalog/api/get-filter-options";
import { getProducts } from "@/features/catalog/api/get-products";
import { FilterPanel } from "@/features/catalog/components/filter-panel";
import { Pagination } from "@/features/catalog/components/pagination";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { parseCatalogSearchParams } from "@/features/catalog/lib/parse-search-params";

interface CatalogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const rawSearchParams = await searchParams;
  const filters = parseCatalogSearchParams(rawSearchParams);

  let productsResult;
  let filterOptions;

  try {
    [productsResult, filterOptions] = await Promise.all([getProducts(filters), getFilterOptions()]);
  } catch {
    return (
      <main className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col px-4 py-8 sm:px-6 md:px-8">
        <ErrorState description="We couldn't load the product catalog. Please try again shortly." />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 md:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold text-foreground">Shop the catalog</h1>
        <p className="max-w-prose text-base text-muted-foreground">
          Browse tops, bottoms, shoes, jackets, bags and accessories, then build a complete outfit.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[16rem_1fr]">
        <Suspense fallback={<LoadingSkeleton className="h-96 w-full" />}>
          <FilterPanel
            colors={filterOptions.colors}
            sizes={filterOptions.sizes}
            styleTags={filterOptions.styleTags}
          />
        </Suspense>

        <div className="flex flex-col gap-6">
          <p className="text-base text-muted-foreground">
            {productsResult.total} {productsResult.total === 1 ? "product" : "products"}
          </p>

          {productsResult.items.length === 0 ? (
            <EmptyState
              title="No products match your filters"
              description="Try adjusting or clearing your filters to see more items."
            />
          ) : (
            <>
              <ProductGrid products={productsResult.items} />
              <Pagination
                total={productsResult.total}
                page={productsResult.page}
                pageSize={productsResult.pageSize}
                rawSearchParams={rawSearchParams}
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
