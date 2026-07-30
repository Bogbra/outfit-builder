import { describe, expect, it } from "vitest";

import { signAdminToken, verifyAdminToken } from "./admin-token";

const SECRET = "test-secret-at-least-32-bytes-long!!";

describe("admin token", () => {
  it("signs and verifies a valid token", async () => {
    const token = await signAdminToken(SECRET, { email: "admin@example.com", role: "admin", jti: "session-1" });
    const payload = await verifyAdminToken(SECRET, token);
    expect(payload).toEqual({ email: "admin@example.com", role: "admin", jti: "session-1" });
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signAdminToken(SECRET, { email: "admin@example.com", role: "admin", jti: "session-1" });
    await expect(verifyAdminToken("a-completely-different-secret-value", token)).rejects.toThrow();
  });

  it("rejects a malformed token", async () => {
    await expect(verifyAdminToken(SECRET, "not-a-real-jwt")).rejects.toThrow();
  });
});
