import { env } from "@/lib/env";

export class GraphQLRequestError extends Error {
  constructor(
    message: string,
    public readonly errors?: unknown,
  ) {
    super(message);
    this.name = "GraphQLRequestError";
  }
}

interface GraphQLResponse<TData> {
  data?: TData;
  errors?: unknown[];
}

export async function graphqlRequest<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  const response = await fetch(`${env.API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    // Product catalog data can be cached briefly — docs/09-scalability.md.
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new GraphQLRequestError(`GraphQL request failed with status ${response.status}`);
  }

  const json = (await response.json()) as GraphQLResponse<TData>;

  if (json.errors && json.errors.length > 0) {
    throw new GraphQLRequestError("GraphQL request returned errors", json.errors);
  }

  if (!json.data) {
    throw new GraphQLRequestError("GraphQL response was missing data");
  }

  return json.data;
}
