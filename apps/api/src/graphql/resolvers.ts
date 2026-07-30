import { productFiltersSchema } from "@outfit-builder/contracts";
import type { Product } from "@outfit-builder/contracts";
import { GraphQLError } from "graphql";

import { getFilterOptions, getProductBySlug, listProducts } from "../repositories/product-repository.js";

function serializeProduct(product: Product) {
  return {
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export const resolvers = {
  Query: {
    apiStatus: () => "ok",

    products: async (_parent: unknown, args: { filters?: unknown }) => {
      const parsed = productFiltersSchema.safeParse(args.filters ?? {});
      if (!parsed.success) {
        throw new GraphQLError("Invalid product filters", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const page = await listProducts(parsed.data);
      return { ...page, items: page.items.map(serializeProduct) };
    },

    product: async (_parent: unknown, args: { slug: string }) => {
      const product = await getProductBySlug(args.slug);
      return product ? serializeProduct(product) : null;
    },

    filterOptions: async () => getFilterOptions(),
  },
};
