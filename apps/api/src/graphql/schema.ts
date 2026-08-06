export const typeDefs = /* GraphQL */ `
  enum Category {
    top
    bottom
    shoes
    jacket
    bag
    accessory
  }

  enum Availability {
    in_stock
    low_stock
    out_of_stock
  }

  type Product {
    id: ID!
    name: String!
    slug: String!
    description: String!
    category: Category!
    priceMinor: Int!
    currency: String!
    images: [String!]!
    colors: [String!]!
    sizes: [String!]!
    styleTags: [String!]!
    material: String!
    availability: Availability!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type ProductPage {
    items: [Product!]!
    total: Int!
    page: Int!
    pageSize: Int!
  }

  input ProductFiltersInput {
    category: Category
    color: String
    size: String
    style: String
    minPriceMinor: Int
    maxPriceMinor: Int
    search: String
    page: Int
    pageSize: Int
  }

  type FilterOptions {
    colors: [String!]!
    sizes: [String!]!
    styleTags: [String!]!
  }

  type Query {
    apiStatus: String!
    products(filters: ProductFiltersInput): ProductPage!
    product(slug: String!): Product
    filterOptions: FilterOptions!
  }
`;
