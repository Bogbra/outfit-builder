"use client";

import { useId } from "react";
import type { ReactNode } from "react";

import { Label } from "../label/label";

export interface FormFieldRenderProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

export interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (fieldProps: FormFieldRenderProps) => ReactNode;
}

// Wires a visible label and an error/hint message to a form control via
// aria-describedby, satisfying docs/06-accessibility.md ("Error messages
// connected to inputs").
export function FormField({ label, hint, error, required, children }: FormFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-error" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </Label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="text-base text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-base text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
