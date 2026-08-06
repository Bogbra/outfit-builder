import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";

import { cn } from "../../lib/cn";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, "aria-invalid": ariaInvalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={ariaInvalid}
        className={cn(
          "flex min-h-24 w-full rounded-sm border border-border-strong bg-surface px-4 py-3 text-base text-foreground",
          "placeholder:text-muted-foreground transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid=true]:border-error aria-[invalid=true]:focus-visible:ring-error",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
