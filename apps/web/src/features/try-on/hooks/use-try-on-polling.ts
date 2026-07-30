"use client";

import type { TryOnResponse } from "@outfit-builder/contracts";
import { useEffect, useState } from "react";

import { getTryOnStatus } from "../api/get-try-on-status";

const POLL_INTERVAL_MS = 2000;

export interface TryOnPollingState {
  result: TryOnResponse | null;
  error: string | null;
}

// Recursive setTimeout, not setInterval — a poll that takes longer than
// the interval (slow network, upstream latency) would otherwise queue up
// overlapping requests. Stops automatically once the request reaches a
// terminal status (completed/failed), and always cleans up on unmount or
// when `id` changes. No async/job infra exists elsewhere in this codebase
// to reuse, hence a client-driven poll rather than a server-side
// background worker.
export function useTryOnPolling(id: string | null): TryOnPollingState {
  const [result, setResult] = useState<TryOnResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    const activeId = id;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      try {
        const status = await getTryOnStatus(activeId);
        if (cancelled) return;
        setResult(status);
        if (status.status === "processing") {
          timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to check try-on status");
      }
    }

    void poll();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [id]);

  // Gated on `id` at render time rather than reset via setState inside the
  // effect (React's set-state-in-effect rule flags the latter — resetting
  // state in an effect is exactly the "you might not need an effect"
  // pattern it warns against). The one consumer (TryOnDialog) always
  // transitions id back through null before ever setting a new one, so
  // this never shows stale content — an old result briefly surviving in
  // state simply isn't returned while id is null.
  return id ? { result, error } : { result: null, error: null };
}
