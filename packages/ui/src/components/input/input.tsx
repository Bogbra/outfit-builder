import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

import { cn } from "../../lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, "aria-invalid": ariaInvalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={ariaInvalid}
        className={cn(
          "flex min-h-11 w-full rounded-sm border border-border-strong bg-surface px-4 text-base text-foreground",
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

Input.displayName = "Input";
