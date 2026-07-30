import { PrismaClient } from "@prisma/client";

// A single shared client instance for the process — Prisma manages its own
// connection pool internally, so this must not be re-instantiated per request.
export const prisma = new PrismaClient();
