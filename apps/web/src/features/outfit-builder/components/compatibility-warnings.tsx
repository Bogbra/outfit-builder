import type { CompatibilityWarning } from "@outfit-builder/contracts";
import { AlertTriangle } from "lucide-react";

export interface CompatibilityWarningsProps {
  warnings: CompatibilityWarning[];
}

export function CompatibilityWarnings({ warnings }: CompatibilityWarningsProps) {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <ul aria-label="Compatibility warnings" className="flex w-full flex-col gap-2">
      {warnings.map((warning) => (
        <li
          key={warning.type}
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-warning/20 bg-warning-bg p-3 text-base text-foreground"
        >
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
          <span>{warning.message}</span>
        </li>
      ))}
    </ul>
  );
}
