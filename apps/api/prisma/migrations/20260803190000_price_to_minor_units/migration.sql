-- Replaces Float price columns with integer minor-units (cents) columns.
-- Written by hand rather than via `prisma migrate dev` because a plain
-- rename would drop existing data on a NOT NULL type change; this backfills
-- from the old columns before dropping them.

-- Product.price (Float) -> Product.priceMinor (Int)
ALTER TABLE "Product" ADD COLUMN "priceMinor" INTEGER;
UPDATE "Product" SET "priceMinor" = ROUND("price" * 100)::int;
ALTER TABLE "Product" ALTER COLUMN "priceMinor" SET NOT NULL;
ALTER TABLE "Product" DROP COLUMN "price";

-- Outfit.totalPrice (Float) -> Outfit.totalPriceMinor (Int)
ALTER TABLE "Outfit" ADD COLUMN "totalPriceMinor" INTEGER;
UPDATE "Outfit" SET "totalPriceMinor" = ROUND("totalPrice" * 100)::int;
ALTER TABLE "Outfit" ALTER COLUMN "totalPriceMinor" SET NOT NULL;
ALTER TABLE "Outfit" DROP COLUMN "totalPrice";
