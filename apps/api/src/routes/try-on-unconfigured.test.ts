import request from "supertest";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Deliberately does NOT mock ../lib/fashn-client.js (unlike try-on.test.ts)
// — this file exercises the real requireApiKey() check, to prove an empty
// FASHN_API_KEY behaves identically to an unset one: the app boots, the
// route responds 503, and no network call to fashn.ai is ever attempted.
// Set before app.js (which transitively loads env.js) is imported — same
// trick admin.test.ts uses for ADMIN_PASSWORD_HASH.
process.env.FASHN_API_KEY = "";

const { createApp } = await import("../app.js");
const { prisma } = await import("../lib/prisma.js");

const PHOTO = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDatabase ? describe : describe.skip;

describeIfDb("try-on REST API with an empty FASHN_API_KEY", () => {
  const app = createApp();
  let topProductId: string;

  beforeAll(async () => {
    const top = await prisma.product.findFirstOrThrow({ where: { category: "top", isActive: true } });
    topProductId = top.id;
  });

  beforeEach(() => {
    vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("boots the app successfully with FASHN_API_KEY=\"\"", () => {
    expect(app).toBeDefined();
  });

  it("responds 503 and makes no request to fashn.ai", async () => {
    const response = await request(app)
      .post("/api/try-on")
      .send({ photo: PHOTO, items: [{ productId: topProductId, category: "top" }] });

    expect(response.status).toBe(503);
    expect(response.body.error).toBe("Virtual try-on is not currently available");
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
