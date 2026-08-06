import { graphqlRequest } from "./graphql-client";

export interface FilterOptionsResult {
  colors: string[];
  sizes: string[];
  styleTags: string[];
}

const FILTER_OPTIONS_QUERY = /* GraphQL */ `
  query FilterOptions {
    filterOptions {
      colors
      sizes
      styleTags
    }
  }
`;

export async function getFilterOptions(): Promise<FilterOptionsResult> {
  const data = await graphqlRequest<{ filterOptions: FilterOptionsResult }>(FILTER_OPTIONS_QUERY);
  return data.filterOptions;
}
