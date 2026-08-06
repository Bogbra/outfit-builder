import type { HTMLAttributes } from "react";

import { cn } from "../../lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-surface shadow-editorial-sm", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2 p-6", className)} {...props} />;
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h2" | "h3" | "h4";
}

export function CardTitle({ className, as: Comp = "h3", ...props }: CardTitleProps) {
  return (
    <Comp className={cn("font-heading text-xl font-semibold text-foreground", className)} {...props} />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-base text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-3 p-6 pt-0", className)} {...props} />;
}
