import { Button } from "@outfit-builder/ui";
import Link from "next/link";

export interface PaginationProps {
  total: number;
  page: number;
  pageSize: number;
  rawSearchParams: Record<string, string | string[] | undefined>;
  basePath?: string;
}

function buildHref(params: URLSearchParams, page: number, basePath: string): string {
  const next = new URLSearchParams(params);
  next.set("page", String(page));
  return `${basePath}?${next.toString()}`;
}

export function Pagination({ total, page, pageSize, rawSearchParams, basePath = "/" }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) {
    return null;
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(rawSearchParams)) {
    if (typeof value === "string" && key !== "page") {
      params.set(key, value);
    }
  }

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-4">
      {prevPage ? (
        <Button asChild variant="secondary">
          <Link href={buildHref(params, prevPage, basePath)}>Previous</Link>
        </Button>
      ) : (
        <Button variant="secondary" disabled>
          Previous
        </Button>
      )}

      <p className="text-base text-muted-foreground">
        Page {page} of {totalPages}
      </p>

      {nextPage ? (
        <Button asChild variant="secondary">
          <Link href={buildHref(params, nextPage, basePath)}>Next</Link>
        </Button>
      ) : (
        <Button variant="secondary" disabled>
          Next
        </Button>
      )}
    </nav>
  );
}
