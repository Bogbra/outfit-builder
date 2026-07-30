import { EnvelopArmor } from "@escape.tech/graphql-armor";
import cors from "cors";
import express, { type Express } from "express";
import { createSchema, createYoga } from "graphql-yoga";
import helmet from "helmet";

import { resolvers } from "./graphql/resolvers.js";
import { typeDefs } from "./graphql/schema.js";
import { env } from "./lib/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { adminAnalyticsRouter } from "./routes/admin-analytics.js";
import { adminProductsRouter } from "./routes/admin-products.js";
import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
import { outfitsRouter } from "./routes/outfits.js";
import { tryOnRouter } from "./routes/try-on.js";

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.NEXT_PUBLIC_APP_URL }));
  // /api/try-on's body parser is registered here, path-scoped, ahead of the
  // blanket 100kb limit below — it must run first so a base64 photo isn't
  // rejected by the tighter default before reaching this route. (body-parser
  // no-ops on a second pass once req.body is already set, so the 100kb
  // middleware below is a safe no-op for this one path, not a second limit.)
  app.use("/api/try-on", express.json({ limit: "8mb" }));
  // Explicit cap on request bodies — none of this API's other payloads
  // (product forms, outfit save requests) are anywhere near this size; a
  // large body is either a mistake or an abuse attempt.
  app.use(express.json({ limit: "100kb" }));

  app.use(healthRouter);
  app.use(authRouter);
  app.use(outfitsRouter);
  app.use(tryOnRouter);
  app.use(adminProductsRouter);
  app.use(adminAnalyticsRouter);

  const schema = createSchema({ typeDefs, resolvers });
  // This schema is flat (no type nests more than 2 levels into itself —
  // `products { items { ... } }` is the deepest real query), so these
  // limits are set close to actual legitimate usage rather than left at
  // graphql-armor's generic defaults, to meaningfully block query-based DoS
  // attempts (deeply nested/aliased/duplicated queries).
  const armor = new EnvelopArmor({
    maxDepth: { n: 4 },
    maxAliases: { n: 15 },
    maxTokens: { n: 1000 },
    costLimit: { maxCost: 50000 },
  });
  const yoga = createYoga({ schema, graphqlEndpoint: "/graphql", plugins: armor.protect().plugins });
  app.use(yoga.graphqlEndpoint, yoga);

  app.use(errorHandler);

  return app;
}
