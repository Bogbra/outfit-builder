import type { Availability } from "@outfit-builder/contracts";

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
};

export const AVAILABILITY_VARIANT: Record<Availability, "success" | "warning" | "error"> = {
  in_stock: "success",
  low_stock: "warning",
  out_of_stock: "error",
};
