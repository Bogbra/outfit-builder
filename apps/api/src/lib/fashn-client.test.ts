import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// This file never imports prisma.js, which is what normally triggers
// @prisma/client's side-effecting .env load in other test files — so
// env.js's required vars have to be supplied directly, the same way
// env.test.ts does it. Set before env.js (transitively loaded by
// fashn-client.js) is imported.
process.env.DATABASE_URL ??= "postgresql://user:password@localhost:5432/test";
process.env.ADMIN_EMAIL ??= "admin@example.com";
process.env.ADMIN_PASSWORD_HASH ??= "$2a$10$abcdefghijklmnopqrstuv";
process.env.AUTH_SECRET ??= "test-secret-that-is-at-least-32-characters-long"; // gitleaks:allow — not a real secret, just a long test fixture string
process.env.FASHN_API_KEY = "test-fashn-key";

const { getTryOnStepStatus, startTryOnStep, FashnApiError, FashnContractError } = await import("./fashn-client.js");

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function invalidJsonResponse(status = 200): Response {
  return new Response("this is not json{{{", { status });
}

describe("fashn-client", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getTryOnStepStatus", () => {
    it.each(["starting", "in_queue", "processing"] as const)(
      "treats documented pre-completion status %s as processing",
      async (status) => {
        vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse({ status }));
        const result = await getTryOnStepStatus("pred-1");
        expect(result).toEqual({ status: "processing" });
      },
    );

    it("returns completed with the output URL for an allowed host", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(
        jsonResponse({ status: "completed", output: ["https://cdn.fashn.ai/result.png"] }),
      );
      const result = await getTryOnStepStatus("pred-2");
      expect(result).toEqual({ status: "completed", outputUrl: "https://cdn.fashn.ai/result.png" });
    });

    it("accepts an output URL from the second documented fashn.ai CDN host", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(
        jsonResponse({ status: "completed", output: ["https://media.fashn.ai/result.png"] }),
      );
      const result = await getTryOnStepStatus("pred-3");
      expect(result).toEqual({ status: "completed", outputUrl: "https://media.fashn.ai/result.png" });
    });

    it("throws a contract error when completed with an output URL from an unexpected host", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(
        jsonResponse({ status: "completed", output: ["https://evil.example.com/result.png"] }),
      );
      await expect(getTryOnStepStatus("pred-4")).rejects.toThrow(FashnContractError);
    });

    // Regression test: the output-URL check used to reuse contracts'
    // ALLOWED_IMAGE_HOSTS, which also allows images.unsplash.com and
    // picsum.photos for seed/demo product photos — neither of those is a
    // real fashn.ai output host, so a "result" pointing there must still
    // be rejected as a contract violation.
    it("throws a contract error when completed with an output URL from a host that's allowed for product images but not fashn.ai output", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(
        jsonResponse({ status: "completed", output: ["https://images.unsplash.com/result.png"] }),
      );
      await expect(getTryOnStepStatus("pred-4b")).rejects.toThrow(FashnContractError);
    });

    it("throws a contract error when completed with no output at all", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse({ status: "completed", output: [] }));
      await expect(getTryOnStepStatus("pred-5")).rejects.toThrow(FashnContractError);
    });

    it("returns failed with the provider's message", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(
        jsonResponse({ status: "failed", error: { message: "moderation rejected" } }),
      );
      const result = await getTryOnStepStatus("pred-6");
      expect(result).toEqual({ status: "failed", error: "moderation rejected" });
    });

    it("throws a contract error for a response shape that doesn't match the documented schema", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse({ status: "some-new-status-fashn-invented" }));
      await expect(getTryOnStepStatus("pred-7")).rejects.toThrow(FashnContractError);
    });

    it("throws FashnApiError with the HTTP status for a non-2xx response", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse({ error: "unauthorized" }, 401));
      const error = await getTryOnStepStatus("pred-8").catch((caught: unknown) => caught);
      expect(error).toBeInstanceOf(FashnApiError);
      expect((error as InstanceType<typeof FashnApiError>).status).toBe(401);
    });

    it("throws FashnApiError with no status on a network failure", async () => {
      vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error("network down"));
      const error = await getTryOnStepStatus("pred-9").catch((caught: unknown) => caught);
      expect(error).toBeInstanceOf(FashnApiError);
      expect((error as InstanceType<typeof FashnApiError>).status).toBeUndefined();
    });

    it("throws a contract error, not a raw SyntaxError, for a 2xx response that isn't valid JSON", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(invalidJsonResponse());
      await expect(getTryOnStepStatus("pred-10")).rejects.toThrow(FashnContractError);
    });
  });

  describe("startTryOnStep", () => {
    it("throws FashnNotConfiguredError when FASHN_API_KEY is unset", async () => {
      // vi.resetModules() + a fresh dynamic import so this module instance
      // re-reads process.env.FASHN_API_KEY — using fresh.FashnNotConfiguredError
      // (not the outer-scope one captured before the reset) since the reset
      // makes it a distinct class from a distinct module evaluation.
      vi.resetModules();
      process.env.FASHN_API_KEY = "";
      const fresh = await import("./fashn-client.js");
      await expect(
        fresh.startTryOnStep({ modelImage: "data:image/jpeg;base64,x", garmentImage: "https://cdn.fashn.ai/g.png" }),
      ).rejects.toThrow(fresh.FashnNotConfiguredError);
      process.env.FASHN_API_KEY = "test-fashn-key";
    });

    it("throws a contract error when the run response has no prediction id", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse({}));
      await expect(
        startTryOnStep({ modelImage: "data:image/jpeg;base64,x", garmentImage: "https://cdn.fashn.ai/g.png" }),
      ).rejects.toThrow(FashnContractError);
    });

    it("returns the prediction id on success", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse({ id: "pred-ok" }));
      const id = await startTryOnStep({
        modelImage: "data:image/jpeg;base64,x",
        garmentImage: "https://cdn.fashn.ai/g.png",
      });
      expect(id).toBe("pred-ok");
    });

    it("throws a contract error, not a raw SyntaxError, for a 2xx response that isn't valid JSON", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(invalidJsonResponse());
      await expect(
        startTryOnStep({ modelImage: "data:image/jpeg;base64,x", garmentImage: "https://cdn.fashn.ai/g.png" }),
      ).rejects.toThrow(FashnContractError);
    });
  });
});
