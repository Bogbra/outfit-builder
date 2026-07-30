"use client";

import { useSyncExternalStore } from "react";

import { getSnapshot, subscribe, type ToastMessage } from "./toast-store";

export function useToastMessages(): ToastMessage[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
