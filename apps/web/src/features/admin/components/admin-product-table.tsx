import { Badge, Button, Card } from "@outfit-builder/ui";
import Image from "next/image";
import Link from "next/link";

import { CATEGORY_LABEL } from "@/features/outfit-builder/lib/category-labels";
import { AVAILABILITY_LABEL, AVAILABILITY_VARIANT } from "@/lib/availability-labels";
import { formatPrice } from "@/lib/format-price";

import type { AdminProduct, AdminProductSortField, SortDirection } from "../api/get-admin-products";
import type { RawSearchParams } from "../lib/parse-admin-products-search-params";
import { SortableColumnHeader } from "./sortable-column-header";

export interface AdminProductTableProps {
  products: AdminProduct[];
  sortBy: AdminProductSortField;
  sortDirection: SortDirection;
  rawSearchParams: RawSearchParams;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

function StatusBadge({ isActive }: { isActive: boolean }) {
  return <Badge variant={isActive ? "success" : "neutral"}>{isActive ? "Active" : "Inactive"}</Badge>;
}

function ProductThumbnail({ product }: { product: AdminProduct }) {
  const [primaryImage] = product.images;
  return (
    <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-background">
      {primaryImage && <Image src={primaryImage} alt="" fill sizes="64px" className="object-cover" />}
    </div>
  );
}

export function AdminProductTable({ products, sortBy, sortDirection, rawSearchParams }: AdminProductTableProps) {
  return (
    <>
      {/* Desktop table */}
      <Card className="hidden overflow-x-auto p-0 md:block">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead className="border-b border-border">
            <tr>
              <th scope="col" className="p-4 text-base font-medium text-foreground">
                Product
              </th>
              <th scope="col" className="p-4 text-base font-medium text-foreground">
                Category
              </th>
              <SortableColumnHeader
                label="Price"
                field="price"
                currentSortBy={sortBy}
                currentSortDirection={sortDirection}
                rawSearchParams={rawSearchParams}
              />
              <th scope="col" className="p-4 text-base font-medium text-foreground">
                Availability
              </th>
              <th scope="col" className="p-4 text-base font-medium text-foreground">
                Status
              </th>
              <SortableColumnHeader
                label="Added"
                field="createdAt"
                currentSortBy={sortBy}
                currentSortDirection={sortDirection}
                rawSearchParams={rawSearchParams}
              />
              <th scope="col" className="p-4 text-base font-medium text-foreground">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-border last:border-b-0">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <ProductThumbnail product={product} />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground">{product.name}</span>
                      <span className="text-base text-muted-foreground">{product.slug}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-base capitalize text-foreground">{CATEGORY_LABEL[product.category]}</td>
                <td className="p-4 text-base text-foreground">{formatPrice(product.price, product.currency)}</td>
                <td className="p-4">
                  <Badge variant={AVAILABILITY_VARIANT[product.availability]}>
                    {AVAILABILITY_LABEL[product.availability]}
                  </Badge>
                </td>
                <td className="p-4">
                  <StatusBadge isActive={product.isActive} />
                </td>
                <td className="p-4 text-base text-muted-foreground">{dateFormatter.format(new Date(product.createdAt))}</td>
                <td className="p-4">
                  <Button asChild variant="ghost">
                    <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Mobile card fallback */}
      <div className="flex flex-col gap-4 md:hidden">
        {products.map((product) => (
          <Card key={product.id} className="p-4">
            <div className="flex gap-3">
              <ProductThumbnail product={product} />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-medium text-foreground">{product.name}</span>
                <span className="truncate text-base text-muted-foreground">{product.slug}</span>
                <span className="text-base capitalize text-foreground">{CATEGORY_LABEL[product.category]}</span>
                <span className="text-base font-medium text-foreground">
                  {formatPrice(product.price, product.currency)}
                </span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant={AVAILABILITY_VARIANT[product.availability]}>
                {AVAILABILITY_LABEL[product.availability]}
              </Badge>
              <StatusBadge isActive={product.isActive} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-base text-muted-foreground">Added {dateFormatter.format(new Date(product.createdAt))}</span>
              <Button asChild variant="secondary">
                <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
