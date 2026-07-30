export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: "success" | "error";
}

let toasts: ToastMessage[] = [];
const listeners = new Set<() => void>();

function emitChange(): void {
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): ToastMessage[] {
  return toasts;
}

export function showToast(toast: Omit<ToastMessage, "id">): string {
  const id = crypto.randomUUID();
  toasts = [...toasts, { ...toast, id }];
  emitChange();
  return id;
}

export function dismissToast(id: string): void {
  toasts = toasts.filter((toast) => toast.id !== id);
  emitChange();
}
