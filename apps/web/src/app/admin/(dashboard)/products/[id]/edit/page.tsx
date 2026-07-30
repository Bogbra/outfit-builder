import { ErrorState } from "@outfit-builder/ui";
import { notFound } from "next/navigation";

import { AdminApiError } from "@/features/admin/api/admin-fetch";
import { getAdminProduct } from "@/features/admin/api/get-admin-products";
import { AdminProductForm } from "@/features/admin/components/admin-product-form";

interface EditAdminProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAdminProductPage({ params }: EditAdminProductPageProps) {
  const { id } = await params;

  let product;
  try {
    product = await getAdminProduct(id);
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 404) {
      notFound();
    }
    return (
      <main className="mx-auto flex w-full max-w-screen-lg flex-1 flex-col px-4 py-8 sm:px-6 md:px-8">
        <ErrorState description="We couldn't load this product. Please try again shortly." />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-screen-lg flex-1 flex-col gap-8 px-4 py-8 sm:px-6 md:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold text-foreground">Edit product</h1>
        <p className="max-w-prose text-base text-muted-foreground">{product.name}</p>
      </header>
      <AdminProductForm mode="edit" product={product} />
    </main>
  );
}
