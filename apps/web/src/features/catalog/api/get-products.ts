import type { Availability, Category } from "@outfit-builder/contracts";

import { graphqlRequest } from "./graphql-client";

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  category: Category;
  price: number;
  currency: string;
  images: string[];
  colors: string[];
  sizes: string[];
  styleTags: string[];
  availability: Availability;
}

export interface ProductPageResult {
  items: CatalogProduct[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CatalogFilters {
  category?: Category;
  color?: string;
  size?: string;
  style?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
}

const PRODUCTS_QUERY = /* GraphQL */ `
  query Products($filters: ProductFiltersInput) {
    products(filters: $filters) {
      total
      page
      pageSize
      items {
        id
        name
        slug
        category
        price
        currency
        images
        colors
        sizes
        styleTags
        availability
      }
    }
  }
`;

export async function getProducts(filters: CatalogFilters): Promise<ProductPageResult> {
  const data = await graphqlRequest<{ products: ProductPageResult }>(PRODUCTS_QUERY, { filters });
  return data.products;
}
