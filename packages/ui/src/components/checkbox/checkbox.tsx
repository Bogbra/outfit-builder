"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ElementRef } from "react";

import { cn } from "../../lib/cn";

export const Checkbox = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "relative inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-border-strong bg-surface",
      // Expands the tap target to 44px without growing the visual box.
      "before:absolute before:-inset-3 before:content-['']",
      "transition-colors duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-primary-foreground">
      <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));

Checkbox.displayName = "Checkbox";
