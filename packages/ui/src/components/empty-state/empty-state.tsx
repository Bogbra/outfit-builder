import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-border-strong bg-surface p-10 text-center",
        className,
      )}
    >
      {icon && (
        <div
          className="flex size-12 items-center justify-center rounded-full bg-background text-muted-foreground"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3 className="font-heading text-xl font-semibold text-foreground">{title}</h3>
      {description && <p className="max-w-prose text-base text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
