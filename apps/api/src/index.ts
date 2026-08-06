import { createApp } from "./app.js";
import { env } from "./lib/env.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.info(`api listening on port ${env.PORT}`);
});

async function shutdown(signal: string): Promise<void> {
  console.info(`${signal} received, shutting down`);
  server.close(() => {
    prisma
      .$disconnect()
      .catch((error: unknown) => console.error("Error disconnecting Prisma", error))
      .finally(() => process.exit(0));
  });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
