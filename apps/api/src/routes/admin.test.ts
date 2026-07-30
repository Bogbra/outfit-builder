import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";

// Overrides the admin password hash with a password only this test file
// knows, before app.js (which transitively loads env.js) is imported —
// keeps the test independent of whatever ADMIN_PASSWORD_HASH is configured
// in the developer's real .env.
const TEST_PASSWORD = "contract-test-password-123";
process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync(TEST_PASSWORD, 10);

const { createApp } = await import("../app.js");
const { env } = await import("../lib/env.js");
const { prisma } = await import("../lib/prisma.js");
const { default: request } = await import("supertest");

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDatabase ? describe : describe.skip;

describeIfDb("admin API", () => {
  const app = createApp();

  async function login(): Promise<string> {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: env.ADMIN_EMAIL, password: TEST_PASSWORD });
    return response.body.token as string;
  }

  describe("POST /api/auth/login", () => {
    it("issues a token for correct credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: env.ADMIN_EMAIL, password: TEST_PASSWORD });
      expect(response.status).toBe(200);
      expect(typeof response.body.token).toBe("string");
    });

    it("rejects an incorrect password with 401", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: env.ADMIN_EMAIL, password: "wrong-password" });
      expect(response.status).toBe(401);
    });

    it("rejects an unknown email with 401", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "nobody@example.com", password: TEST_PASSWORD });
      expect(response.status).toBe(401);
    });

    it("rejects a malformed body with 422", async () => {
      const response = await request(app).post("/api/auth/login").send({ email: "not-an-email" });
      expect(response.status).toBe(422);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("rejects a logout request without a token with 401", async () => {
      const response = await request(app).post("/api/auth/logout");
      expect(response.status).toBe(401);
    });

    it("revokes the session so the same token is rejected afterwards", async () => {
      const token = await login();

      const beforeLogout = await request(app).get("/api/admin/products").set("Authorization", `Bearer ${token}`);
      expect(beforeLogout.status).toBe(200);

      const logoutResponse = await request(app).post("/api/auth/logout").set("Authorization", `Bearer ${token}`);
      expect(logoutResponse.status).toBe(204);

      const afterLogout = await request(app).get("/api/admin/products").set("Authorization", `Bearer ${token}`);
      expect(afterLogout.status).toBe(401);
    });
  });

  describe("admin product routes", () => {
    it("rejects requests without a token with 401", async () => {
      const response = await request(app).get("/api/admin/products");
      expect(response.status).toBe(401);
    });

    it("rejects requests with an invalid token with 401", async () => {
      const response = await request(app)
        .get("/api/admin/products")
        .set("Authorization", "Bearer not-a-real-token");
      expect(response.status).toBe(401);
    });

    it("lists all products (including inactive) for an authenticated admin", async () => {
      const token = await login();
      const response = await request(app).get("/api/admin/products").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.total).toBeGreaterThan(0);
    });

    it("creates, reads and updates a product end to end", async () => {
      const token = await login();

      const createResponse = await request(app)
        .post("/api/admin/products")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Contract Test Scarf",
          slug: "contract-test-scarf",
          description: "Test product.",
          category: "accessory",
          price: 19,
          currency: "EUR",
          images: ["https://picsum.photos/seed/contract-test-scarf/800/1000"],
          colors: ["red"],
          sizes: ["One Size"],
          material: "Wool",
          availability: "in_stock",
        });
      expect(createResponse.status).toBe(201);
      const id: string = createResponse.body.id;

      const getResponse = await request(app)
        .get(`/api/admin/products/${id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.name).toBe("Contract Test Scarf");

      const updateResponse = await request(app)
        .patch(`/api/admin/products/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ isActive: false, price: 25 });
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.isActive).toBe(false);
      expect(updateResponse.body.price).toBe(25);

      await prisma.product.delete({ where: { id } });
    });

    it("rejects a duplicate slug with 422", async () => {
      const token = await login();
      const existing = await prisma.product.findFirstOrThrow();

      const response = await request(app)
        .post("/api/admin/products")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Duplicate",
          slug: existing.slug,
          description: "x",
          category: "accessory",
          price: 10,
          currency: "EUR",
          images: ["https://picsum.photos/seed/dup/800/1000"],
          colors: ["red"],
          sizes: ["One Size"],
          material: "x",
          availability: "in_stock",
        });
      expect(response.status).toBe(422);
    });

    it("rejects invalid product data with 422", async () => {
      const token = await login();
      const response = await request(app)
        .post("/api/admin/products")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "" });
      expect(response.status).toBe(422);
    });

    it("returns 404 when updating a nonexistent product", async () => {
      const token = await login();
      const response = await request(app)
        .patch("/api/admin/products/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${token}`)
        .send({ price: 10 });
      expect(response.status).toBe(404);
    });
  });

  describe("GET /api/admin/analytics", () => {
    it("rejects requests without a token with 401", async () => {
      const response = await request(app).get("/api/admin/analytics");
      expect(response.status).toBe(401);
    });

    it("returns analytics for an authenticated admin", async () => {
      const token = await login();
      const response = await request(app)
        .get("/api/admin/analytics")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("totalProducts");
      expect(response.body).toHaveProperty("totalSavedOutfits");
      expect(response.body).toHaveProperty("mostUsedCategory");
      expect(response.body).toHaveProperty("averageOutfitPrice");
      expect(response.body.totalProducts).toBeGreaterThan(0);
    });
  });

  // Placed last: exhausts the shared login rate limiter, so any test that
  // still needs a fresh login() must run before this one.
  describe("login rate limiting", () => {
    it(
      "rate limits repeated login attempts",
      async () => {
        const limit = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 30);
        const attempts = limit + 10;
        const statuses: number[] = [];
        for (let i = 0; i < attempts; i++) {
          const response = await request(app)
            .post("/api/auth/login")
            .send({ email: env.ADMIN_EMAIL, password: "wrong-password" });
          statuses.push(response.status);
        }
        expect(statuses).toContain(429);
      },
      20000,
    );
  });
});
