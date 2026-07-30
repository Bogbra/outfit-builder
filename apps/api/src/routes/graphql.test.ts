import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../app.js";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDatabase ? describe : describe.skip;

describeIfDb("GraphQL endpoint", () => {
  const app = createApp();

  it("answers a normal query", async () => {
    const response = await request(app)
      .post("/graphql")
      .send({ query: "{ apiStatus }" });
    expect(response.status).toBe(200);
    expect(response.body.data.apiStatus).toBe("ok");
  });

  it("blocks a query with too many aliases (graphql-armor maxAliases)", async () => {
    // 20 aliases of the same field, well past the configured limit of 15
    // (apps/api/src/app.ts) — a classic query-based DoS shape.
    const aliasedQuery = Array.from({ length: 20 }, (_, i) => `a${i}: apiStatus`).join("\n");
    const response = await request(app)
      .post("/graphql")
      .send({ query: `{ ${aliasedQuery} }` });

    expect(response.status).toBe(200); // GraphQL errors are still HTTP 200
    expect(response.body.errors).toBeTruthy();
    expect(response.body.data).toBeFalsy();
  });
});
