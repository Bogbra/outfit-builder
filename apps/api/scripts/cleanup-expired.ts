// Deletes expired TryOnRequest and AdminSession rows. Nothing in this
// codebase automatically expires them otherwise — TryOnRequest.expiresAt and
// AdminSession.expiresAt are only ever checked at read time (a request past
// its expiry stops being returned), never enforced by a background process,
// so the rows themselves accumulate indefinitely without this.
//
// There's no long-running worker in this API (see try-on-repository.ts for
// why), so this is meant to run as a one-off invocation from an external
// scheduler — a Cloud Run Job on a Cloud Scheduler trigger, a scheduled
// GitHub Actions workflow, or a plain crontab entry — not from inside the
// API process itself. Run manually with `pnpm --filter api cleanup:expired`.
import { prisma } from "../src/lib/prisma.js";

async function main(): Promise<void> {
  const now = new Date();

  const [tryOnRequests, adminSessions] = await Promise.all([
    prisma.tryOnRequest.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.adminSession.deleteMany({ where: { expiresAt: { lt: now } } }),
  ]);

  console.info(
    `Deleted ${tryOnRequests.count} expired try-on request(s) and ${adminSessions.count} expired admin session(s).`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("cleanup-expired failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
