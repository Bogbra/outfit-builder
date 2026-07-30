-- CreateEnum
CREATE TYPE "Category" AS ENUM ('top', 'bottom', 'shoes', 'jacket', 'bag', 'accessory');

-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('in_stock', 'low_stock', 'out_of_stock');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "images" TEXT[],
    "colors" TEXT[],
    "sizes" TEXT[],
    "styleTags" TEXT[],
    "material" TEXT NOT NULL,
    "availability" "Availability" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");
