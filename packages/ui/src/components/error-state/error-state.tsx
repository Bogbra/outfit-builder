import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-error/20 bg-error-bg p-10 text-center",
        className,
      )}
    >
      <div
        className="flex size-12 items-center justify-center rounded-full bg-surface text-error"
        aria-hidden="true"
      >
        <AlertTriangle className="size-6" />
      </div>
      <h3 className="font-heading text-xl font-semibold text-foreground">{title}</h3>
      {description && <p className="max-w-prose text-base text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
