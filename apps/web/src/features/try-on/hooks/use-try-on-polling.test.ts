import type { TryOnResponse } from "@outfit-builder/contracts";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTryOnPolling } from "./use-try-on-polling";

const getTryOnStatusMock = vi.fn();

vi.mock("../api/get-try-on-status", () => ({
  getTryOnStatus: (...args: unknown[]) => getTryOnStatusMock(...args),
}));

function response(overrides: Partial<TryOnResponse> = {}): TryOnResponse {
  return {
    id: "run-1",
    status: "completed",
    step: 1,
    totalSteps: 1,
    resultImageUrl: "https://cdn.fashn.ai/result.png",
    error: null,
    ...overrides,
  };
}

// Resolves manually, so a test can assert on hook state *before* the
// promise settles — that in-between moment is exactly where the regression
// this file guards against used to show a previous run's stale result.
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe("useTryOnPolling", () => {
  beforeEach(() => {
    getTryOnStatusMock.mockReset();
  });

  it("returns null result/error when id is null", () => {
    const { result } = renderHook(() => useTryOnPolling(null));
    expect(result.current).toEqual({ result: null, error: null });
  });

  it("does not show a completed run's stale result while a second run's first poll is still in flight", async () => {
    const firstRun = deferred<TryOnResponse>();
    getTryOnStatusMock.mockReturnValueOnce(firstRun.promise);

    const { result, rerender } = renderHook(({ id }) => useTryOnPolling(id), {
      initialProps: { id: "run-1" as string | null },
    });

    firstRun.resolve(response({ id: "run-1", status: "completed" }));
    await waitFor(() => expect(result.current.result?.status).toBe("completed"));

    // A real user flow always transitions the dialog's id back through
    // null before starting a new run (see TryOnDialog's reset()) — this
    // mirrors that, then immediately starts a second run whose first poll
    // deliberately never resolves within this test.
    rerender({ id: null });
    expect(result.current).toEqual({ result: null, error: null });

    const secondRun = deferred<TryOnResponse>();
    getTryOnStatusMock.mockReturnValueOnce(secondRun.promise);
    rerender({ id: "run-2" });

    // The regression: before this fix, the hook only cleared its state
    // while id was null — the instant id became "run-2" again, the old
    // "run-1" completed result reappeared even though "run-2" hasn't
    // gotten a single poll response yet.
    expect(result.current.result).toBeNull();

    secondRun.resolve(response({ id: "run-2", status: "processing" }));
    await waitFor(() => expect(result.current.result?.status).toBe("processing"));
  });

  it("does not surface a previous run's error against a new run's id", async () => {
    getTryOnStatusMock.mockRejectedValueOnce(new Error("network blip"));
    const { result, rerender } = renderHook(({ id }) => useTryOnPolling(id), {
      initialProps: { id: "run-1" as string | null },
    });

    await waitFor(() => expect(result.current.error).toBe("network blip"));

    rerender({ id: null });
    const secondRun = deferred<TryOnResponse>();
    getTryOnStatusMock.mockReturnValueOnce(secondRun.promise);
    rerender({ id: "run-2" });

    expect(result.current.error).toBeNull();
  });
});
