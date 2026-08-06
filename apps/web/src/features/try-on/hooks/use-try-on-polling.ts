"use client";

import type { TryOnResponse } from "@outfit-builder/contracts";
import { useEffect, useState } from "react";

import { getTryOnStatus } from "../api/get-try-on-status";

const POLL_INTERVAL_MS = 2000;

export interface TryOnPollingState {
  result: TryOnResponse | null;
  error: string | null;
}

// Tags a piece of state with the id it belongs to, so a value from a
// previous try-on run can be told apart from one belonging to the current
// `id` — see the id-gating at the bottom of the hook for why this matters.
interface IdBound<T> {
  id: string;
  value: T;
}

// Recursive setTimeout, not setInterval — a poll that takes longer than
// the interval (slow network, upstream latency) would otherwise queue up
// overlapping requests. Stops automatically once the request reaches a
// terminal status (completed/failed), and always cleans up on unmount or
// when `id` changes. No async/job infra exists elsewhere in this codebase
// to reuse, hence a client-driven poll rather than a server-side
// background worker.
export function useTryOnPolling(id: string | null): TryOnPollingState {
  const [result, setResult] = useState<IdBound<TryOnResponse> | null>(null);
  const [error, setError] = useState<IdBound<string> | null>(null);

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
        setResult({ id: activeId, value: status });
        if (status.status === "processing") {
          timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (cancelled) return;
        setError({ id: activeId, value: err instanceof Error ? err.message : "Failed to check try-on status" });
      }
    }

    void poll();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [id]);

  // `result`/`error` from a run that just ended aren't cleared the instant
  // `id` changes — React state updates are async, and the old value would
  // otherwise still be sitting there, unlabeled, when a new run's first
  // render happens. Comparing each value's own `id` against the current
  // `id` (rather than gating only on `id !== null`, which this hook used
  // to do) is what actually prevents a completed run's result from
  // flashing back up for a beat when a second try-on starts before its
  // own first poll has resolved.
  return {
    result: id && result?.id === id ? result.value : null,
    error: id && error?.id === id ? error.value : null,
  };
}
