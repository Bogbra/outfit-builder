// Basic throughput/latency smoke test against a running apps/api instance.
// Not part of CI (no pass/fail gate is defined for perf numbers yet) — run
// manually with `pnpm --filter api load-test` against a local or staging
// deployment before any change that touches hot paths (catalog query,
// outfit save).
import autocannon, { type Result } from "autocannon";

const baseUrl = process.env.LOAD_TEST_URL ?? "http://localhost:8080";
const duration = Number(process.env.LOAD_TEST_DURATION_SECONDS ?? 10);
const connections = Number(process.env.LOAD_TEST_CONNECTIONS ?? 10);

const PRODUCTS_QUERY = /* GraphQL */ `
  query LoadTestProducts($filters: ProductFiltersInput) {
    products(filters: $filters) {
      total
      items {
        id
        name
        priceMinor
        images
      }
    }
  }
`;

interface Scenario {
  name: string;
  requests: autocannon.Options["requests"];
}

const scenarios: Scenario[] = [
  {
    name: "GraphQL: browse catalog (page 1, no filters)",
    requests: [
      {
        method: "POST",
        path: "/graphql",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          query: PRODUCTS_QUERY,
          variables: { filters: { page: 1, pageSize: 20 } },
        }),
      },
    ],
  },
  {
    name: "GraphQL: browse catalog (filtered)",
    requests: [
      {
        method: "POST",
        path: "/graphql",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          query: PRODUCTS_QUERY,
          variables: { filters: { category: "top", page: 1, pageSize: 20 } },
        }),
      },
    ],
  },
  {
    name: "REST: list saved outfits",
    requests: [{ method: "GET", path: "/api/outfits" }],
  },
];

function summarize(name: string, result: Result): void {
  const errorCount = result.errors + result.timeouts + result.non2xx;
  console.info(`\n${name}`);
  console.info(`  requests: ${result.requests.total} over ${result.duration}s (${result.requests.average}/s avg)`);
  console.info(`  latency:  p50=${result.latency.p50}ms p99=${result.latency.p99}ms max=${result.latency.max}ms`);
  console.info(`  errors:   ${errorCount} (${result.non2xx} non-2xx, ${result.errors} conn errors, ${result.timeouts} timeouts)`);
}

async function main() {
  console.info(`Load testing ${baseUrl} — ${connections} connections, ${duration}s per scenario`);
  console.info(
    `NOTE: apps/api rate-limits write endpoints (default ${process.env.RATE_LIMIT_MAX_REQUESTS ?? 30} req/${process.env.RATE_LIMIT_WINDOW_SECONDS ?? 60}s per IP) — these read-only scenarios avoid that limiter deliberately.`,
  );

  for (const scenario of scenarios) {
    const result = await autocannon({
      url: baseUrl,
      connections,
      duration,
      requests: scenario.requests,
    });
    summarize(scenario.name, result);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
