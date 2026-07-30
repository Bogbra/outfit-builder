import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";

// Runs against the real local Postgres — see README.md "Getting Started".
// Skipped automatically when DATABASE_URL isn't set.
const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDatabase ? describe : describe.skip;

describeIfDb("outfits REST API", () => {
  const app = createApp();
  let productId: string;
  let productColor: string;
  let productSize: string;

  beforeAll(async () => {
    const product = await prisma.product.findFirstOrThrow({ where: { category: "top", isActive: true } });
    productId = product.id;
    const [color] = product.colors;
    const [size] = product.sizes;
    if (!color || !size) {
      throw new Error("Seed product used for outfit contract tests must have at least one color and size");
    }
    productColor = color;
    productSize = size;
  });

  it("creates an outfit and recomputes price/completeness/style tags server-side", async () => {
    const response = await request(app)
      .post("/api/outfits")
      .send({
        name: "Contract Test Outfit",
        items: [{ productId, category: "top", selectedColor: productColor, selectedSize: productSize }],
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe("Contract Test Outfit");
    expect(response.body.validationStatus).toBe("incomplete");
    expect(response.body.totalPrice).toBeGreaterThan(0);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].product.id).toBe(productId);
  });

  it("rejects an empty items array with 422", async () => {
    const response = await request(app).post("/api/outfits").send({ name: "Empty", items: [] });
    expect(response.status).toBe(422);
    expect(response.body.error).toBeTruthy();
  });

  it("rejects a missing name with 422", async () => {
    const response = await request(app)
      .post("/api/outfits")
      .send({
        items: [{ productId, category: "top", selectedColor: productColor, selectedSize: productSize }],
      });
    expect(response.status).toBe(422);
  });

  it("rejects two items in the same category with 422", async () => {
    const response = await request(app)
      .post("/api/outfits")
      .send({
        name: "Duplicate category",
        items: [
          { productId, category: "top", selectedColor: productColor, selectedSize: productSize },
          { productId, category: "top", selectedColor: productColor, selectedSize: productSize },
        ],
      });
    expect(response.status).toBe(422);
  });

  it("rejects a nonexistent product with 422 and a safe message", async () => {
    const response = await request(app)
      .post("/api/outfits")
      .send({
        name: "Ghost",
        items: [
          {
            productId: "00000000-0000-0000-0000-000000000000",
            category: "top",
            selectedColor: "x",
            selectedSize: "y",
          },
        ],
      });
    expect(response.status).toBe(422);
    expect(response.body.error).not.toMatch(/at |node_modules|\.ts:\d/);
  });

  it("rejects a color that isn't a real variant of the product with 422", async () => {
    const response = await request(app)
      .post("/api/outfits")
      .send({
        name: "Bad variant",
        items: [{ productId, category: "top", selectedColor: "not-a-real-color", selectedSize: productSize }],
      });
    expect(response.status).toBe(422);
  });

  it("rejects an outfit item whose claimed category does not match the product with 422", async () => {
    const response = await request(app)
      .post("/api/outfits")
      .send({
        name: "Mismatched category",
        items: [{ productId, category: "shoes", selectedColor: productColor, selectedSize: productSize }],
      });
    expect(response.status).toBe(422);
    expect(response.body.error).toBeTruthy();
  });

  it("lists, fetches by id and deletes an outfit end to end", async () => {
    const created = await request(app)
      .post("/api/outfits")
      .send({
        name: "Lifecycle Outfit",
        items: [{ productId, category: "top", selectedColor: productColor, selectedSize: productSize }],
      });
    const id: string = created.body.id;

    const listResponse = await request(app).get("/api/outfits");
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.items.some((outfit: { id: string }) => outfit.id === id)).toBe(true);

    const getResponse = await request(app).get(`/api/outfits/${id}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.id).toBe(id);

    const deleteResponse = await request(app).delete(`/api/outfits/${id}`);
    expect(deleteResponse.status).toBe(204);

    const getAfterDelete = await request(app).get(`/api/outfits/${id}`);
    expect(getAfterDelete.status).toBe(404);
  });

  it("returns 404 for a nonexistent outfit id", async () => {
    const response = await request(app).get("/api/outfits/00000000-0000-0000-0000-000000000000");
    expect(response.status).toBe(404);
  });

  it("returns 422 for a malformed outfit id", async () => {
    const response = await request(app).get("/api/outfits/not-a-uuid");
    expect(response.status).toBe(422);
  });

  it("rejects an oversized request body without crashing or leaking internals", async () => {
    // app.ts caps express.json() at 100kb.
    const oversizedName = "x".repeat(200_000);
    const response = await request(app)
      .post("/api/outfits")
      .send({
        name: oversizedName,
        items: [{ productId, category: "top", selectedColor: productColor, selectedSize: productSize }],
      });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
    expect(Object.keys(response.body)).toEqual(["error"]);
    expect(response.body.error).not.toMatch(/at |node_modules|\.ts:\d|stack/i);
  });

  it(
    "rate limits repeated write requests",
    async () => {
      const limit = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 30);
      const attempts = limit + 10;
      const statuses: number[] = [];
      for (let i = 0; i < attempts; i++) {
        const response = await request(app)
          .post("/api/outfits")
          .send({ name: "Rate limit probe", items: [] });
        statuses.push(response.status);
      }
      expect(statuses).toContain(429);
    },
    20000,
  );
});
