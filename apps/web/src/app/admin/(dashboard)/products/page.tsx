import { Button, EmptyState, ErrorState } from "@outfit-builder/ui";
import Link from "next/link";

import { AdminProductSearchForm } from "@/features/admin/components/admin-product-search-form";
import { AdminProductTable } from "@/features/admin/components/admin-product-table";
import { getAdminProducts } from "@/features/admin/api/get-admin-products";
import { parseAdminProductsSearchParams } from "@/features/admin/lib/parse-admin-products-search-params";
import { Pagination } from "@/features/catalog/components/pagination";

interface AdminProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const rawSearchParams = await searchParams;
  const params = parseAdminProductsSearchParams(rawSearchParams);

  let result;
  try {
    result = await getAdminProducts(params);
  } catch {
    return (
      <main className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col px-4 py-8 sm:px-6 md:px-8">
        <ErrorState description="We couldn't load the product list. Please try again shortly." />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 md:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold text-foreground">Products</h1>
          <p className="max-w-prose text-base text-muted-foreground">
            Manage the catalog — {result.total} {result.total === 1 ? "product" : "products"} total.
          </p>
        </div>
        <Button asChild variant="primary">
          <Link href="/admin/products/new">New product</Link>
        </Button>
      </header>

      <AdminProductSearchForm />

      {result.items.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try a different search, or add a new product to the catalog."
        />
      ) : (
        <>
          <AdminProductTable
            products={result.items}
            sortBy={params.sortBy}
            sortDirection={params.sortDirection}
            rawSearchParams={rawSearchParams}
          />
          <Pagination
            total={result.total}
            page={result.page}
            pageSize={result.pageSize}
            rawSearchParams={rawSearchParams}
            basePath="/admin/products"
          />
        </>
      )}
    </main>
  );
}
