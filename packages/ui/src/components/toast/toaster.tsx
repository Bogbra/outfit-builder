"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, X, XCircle } from "lucide-react";

import { cn } from "../../lib/cn";
import { dismissToast } from "./toast-store";
import { useToastMessages } from "./use-toast-messages";

const VARIANT_ICON = { success: CheckCircle2, error: XCircle };

const VARIANT_CLASS: Record<"success" | "error", string> = {
  success: "border-success/20 bg-success-bg",
  error: "border-error/20 bg-error-bg",
};

export function Toaster() {
  const toasts = useToastMessages();

  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
      {toasts.map((toast) => {
        const Icon = VARIANT_ICON[toast.variant];
        return (
          <ToastPrimitive.Root
            key={toast.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-4 shadow-editorial-lg",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
              "data-[swipe=end]:animate-out",
              VARIANT_CLASS[toast.variant],
            )}
            onOpenChange={(open) => {
              if (!open) dismissToast(toast.id);
            }}
          >
            <Icon className="mt-0.5 size-5 shrink-0 text-foreground" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <ToastPrimitive.Title className="text-base font-medium text-foreground">
                {toast.title}
              </ToastPrimitive.Title>
              {toast.description && (
                <ToastPrimitive.Description className="text-base text-muted-foreground">
                  {toast.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close
              className={cn(
                "ml-auto flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground",
                "transition-colors duration-200 hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
              aria-label="Dismiss notification"
            >
              <X className="size-4" aria-hidden="true" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        );
      })}
      <ToastPrimitive.Viewport className="fixed right-0 bottom-0 z-50 flex w-full max-w-sm flex-col gap-3 p-4 outline-none sm:right-4 sm:bottom-4" />
    </ToastPrimitive.Provider>
  );
}
