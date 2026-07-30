import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// A generous override so the ~5 legitimate POSTs in this file don't
// accidentally exhaust the real default (5/hour, deliberately tight)
// before the dedicated rate-limit test below. Set before app.js (which
// transitively loads env.js) is imported — same trick admin.test.ts uses
// for ADMIN_PASSWORD_HASH.
process.env.TRYON_RATE_LIMIT_MAX_REQUESTS = "100";

vi.mock("../lib/fashn-client.js", () => ({
  startTryOnStep: vi.fn(),
  getTryOnStepStatus: vi.fn(),
  FashnApiError: class FashnApiError extends Error {},
  FashnNotConfiguredError: class FashnNotConfiguredError extends Error {},
}));

const { createApp } = await import("../app.js");
const { prisma } = await import("../lib/prisma.js");
const { startTryOnStep, getTryOnStepStatus } = await import("../lib/fashn-client.js");

const startTryOnStepMock = vi.mocked(startTryOnStep);
const getTryOnStepStatusMock = vi.mocked(getTryOnStepStatus);

const PHOTO = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDatabase ? describe : describe.skip;

describeIfDb("try-on REST API", () => {
  const app = createApp();
  let topProductId: string;
  let bottomProductId: string;

  beforeAll(async () => {
    const [top, bottom] = await Promise.all([
      prisma.product.findFirstOrThrow({ where: { category: "top", isActive: true } }),
      prisma.product.findFirstOrThrow({ where: { category: "bottom", isActive: true } }),
    ]);
    topProductId = top.id;
    bottomProductId = bottom.id;
  });

  // No global clearMocks/restoreMocks in vitest.config.ts — call history
  // (and therefore .not.toHaveBeenCalled()/.toHaveBeenLastCalledWith()
  // assertions) would otherwise leak across tests in this file.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("runs a single-item chain to completion", async () => {
    startTryOnStepMock.mockResolvedValueOnce("prediction-1");
    const createResponse = await request(app)
      .post("/api/try-on")
      .send({ photo: PHOTO, items: [{ productId: topProductId, category: "top" }] });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({ status: "processing", step: 1, totalSteps: 1 });
    expect(startTryOnStepMock).toHaveBeenCalledWith(
      expect.objectContaining({ modelImage: PHOTO, garmentImage: expect.any(String) }),
    );

    getTryOnStepStatusMock.mockResolvedValueOnce({
      status: "completed",
      outputUrl: "https://cdn.fashn.ai/result-1.png",
    });
    const pollResponse = await request(app).get(`/api/try-on/${createResponse.body.id}`);

    expect(pollResponse.status).toBe(200);
    expect(pollResponse.body).toMatchObject({
      status: "completed",
      step: 1,
      totalSteps: 1,
      resultImageUrl: "https://cdn.fashn.ai/result-1.png",
    });
  });

  it("chains two items, kicking off the second step once the first completes", async () => {
    startTryOnStepMock.mockResolvedValueOnce("prediction-a");
    const createResponse = await request(app)
      .post("/api/try-on")
      .send({
        photo: PHOTO,
        items: [
          { productId: topProductId, category: "top" },
          { productId: bottomProductId, category: "bottom" },
        ],
      });
    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({ status: "processing", step: 1, totalSteps: 2 });

    // First poll: step 1 still processing upstream.
    getTryOnStepStatusMock.mockResolvedValueOnce({ status: "processing" });
    const firstPoll = await request(app).get(`/api/try-on/${createResponse.body.id}`);
    expect(firstPoll.body).toMatchObject({ status: "processing", step: 1, totalSteps: 2 });

    // Second poll: step 1 completes, step 2 kicks off automatically.
    getTryOnStepStatusMock.mockResolvedValueOnce({
      status: "completed",
      outputUrl: "https://cdn.fashn.ai/result-step1.png",
    });
    startTryOnStepMock.mockResolvedValueOnce("prediction-b");
    const secondPoll = await request(app).get(`/api/try-on/${createResponse.body.id}`);
    expect(secondPoll.body).toMatchObject({ status: "processing", step: 2, totalSteps: 2 });
    expect(startTryOnStepMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ modelImage: "https://cdn.fashn.ai/result-step1.png" }),
    );

    // Third poll: step 2 completes, request is done.
    getTryOnStepStatusMock.mockResolvedValueOnce({
      status: "completed",
      outputUrl: "https://cdn.fashn.ai/result-step2.png",
    });
    const thirdPoll = await request(app).get(`/api/try-on/${createResponse.body.id}`);
    expect(thirdPoll.body).toMatchObject({
      status: "completed",
      step: 2,
      totalSteps: 2,
      resultImageUrl: "https://cdn.fashn.ai/result-step2.png",
    });
  });

  it("surfaces a fashn.ai step failure as a clean failed status", async () => {
    startTryOnStepMock.mockResolvedValueOnce("prediction-fail");
    const createResponse = await request(app)
      .post("/api/try-on")
      .send({ photo: PHOTO, items: [{ productId: topProductId, category: "top" }] });

    getTryOnStepStatusMock.mockResolvedValueOnce({ status: "failed", error: "moderation rejected the image" });
    const pollResponse = await request(app).get(`/api/try-on/${createResponse.body.id}`);

    expect(pollResponse.status).toBe(200);
    expect(pollResponse.body.status).toBe("failed");
    expect(pollResponse.body.error).toBeTruthy();
  });

  it("rejects a photo that isn't a base64 image data URL with 422", async () => {
    const response = await request(app)
      .post("/api/try-on")
      .send({ photo: "https://example.com/photo.jpg", items: [{ productId: topProductId, category: "top" }] });
    expect(response.status).toBe(422);
    expect(startTryOnStepMock).not.toHaveBeenCalled();
  });

  it("rejects a nonexistent product with 422 and a safe message", async () => {
    const response = await request(app)
      .post("/api/try-on")
      .send({
        photo: PHOTO,
        items: [{ productId: "00000000-0000-0000-0000-000000000000", category: "top" }],
      });
    expect(response.status).toBe(422);
    expect(response.body.error).not.toMatch(/at |node_modules|\.ts:\d/);
  });

  it("ignores a claimed category that doesn't match the product and uses the real one", async () => {
    startTryOnStepMock.mockResolvedValueOnce("prediction-mismatch");
    // topProductId is actually a "top" — claiming "bottom" must not let it
    // try on (or be stored) as the wrong garment slot.
    const response = await request(app)
      .post("/api/try-on")
      .send({ photo: PHOTO, items: [{ productId: topProductId, category: "bottom" }] });

    expect(response.status).toBe(201);
    const stored = await prisma.tryOnRequest.findUniqueOrThrow({ where: { id: response.body.id } });
    expect(stored.items).toEqual([expect.objectContaining({ category: "top" })]);
  });

  it("returns 404 for a nonexistent try-on request id", async () => {
    const response = await request(app).get("/api/try-on/00000000-0000-0000-0000-000000000000");
    expect(response.status).toBe(404);
  });

  it("returns 404 for an expired try-on request instead of continuing to advance it", async () => {
    startTryOnStepMock.mockResolvedValueOnce("prediction-expired");
    const createResponse = await request(app)
      .post("/api/try-on")
      .send({ photo: PHOTO, items: [{ productId: topProductId, category: "top" }] });

    await prisma.tryOnRequest.update({
      where: { id: createResponse.body.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    const pollResponse = await request(app).get(`/api/try-on/${createResponse.body.id}`);
    expect(pollResponse.status).toBe(404);
    expect(getTryOnStepStatusMock).not.toHaveBeenCalled();
  });

  it("returns 422 for a malformed try-on request id", async () => {
    const response = await request(app).get("/api/try-on/not-a-uuid");
    expect(response.status).toBe(422);
  });

  // Placed last: exhausts the shared try-on rate limiter (same convention
  // as admin.test.ts's login-rate-limit test).
  it(
    "rate limits repeated try-on requests",
    async () => {
      const limit = Number(process.env.TRYON_RATE_LIMIT_MAX_REQUESTS);
      const attempts = limit + 5;
      startTryOnStepMock.mockResolvedValue("prediction-rl");
      const statuses: number[] = [];
      for (let i = 0; i < attempts; i++) {
        const response = await request(app)
          .post("/api/try-on")
          .send({ photo: PHOTO, items: [{ productId: topProductId, category: "top" }] });
        statuses.push(response.status);
      }
      expect(statuses).toContain(429);
    },
    20000,
  );
});
