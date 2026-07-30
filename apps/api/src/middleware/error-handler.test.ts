import { describe, expect, it, vi } from "vitest";
import type { Response } from "express";

import { errorHandler } from "./error-handler.js";

function mockResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

describe("errorHandler", () => {
  it("returns a generic 500 for an unknown error without leaking its message or stack", () => {
    const res = mockResponse();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    errorHandler(new Error("Prisma connection string: postgres://user:secret@host/db"), {} as never, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    consoleSpy.mockRestore();
  });

  it("returns a generic 500 for a plain thrown string", () => {
    const res = mockResponse();
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    errorHandler("something broke", {} as never, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
  });

  it("preserves a known safe 4xx status (e.g. body-parser's 413) with a generic message", () => {
    const res = mockResponse();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const payloadTooLarge = Object.assign(new Error("request entity too large"), {
      status: 413,
      type: "entity.too.large",
    });

    errorHandler(payloadTooLarge, {} as never, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith({ error: "Request body too large" });
  });

  it("does not trust an arbitrary or 5xx status smuggled on the error object", () => {
    const res = mockResponse();
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    errorHandler(Object.assign(new Error("x"), { status: 503 }), {} as never, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
  });
});
