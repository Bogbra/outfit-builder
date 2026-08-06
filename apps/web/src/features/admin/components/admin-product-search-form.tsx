"use client";

import { Button, FormField, Input } from "@outfit-builder/ui";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

export function AdminProductSearchForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next = new URLSearchParams(searchParams);
    next.delete("page");
    if (search) {
      next.set("search", search);
    } else {
      next.delete("search");
    }

    router.push(next.size > 0 ? `${pathname}?${next.toString()}` : pathname);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="w-full max-w-sm">
        <FormField label="Search products">
          {(field) => (
            <Input
              {...field}
              type="search"
              placeholder="Search by name or description"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          )}
        </FormField>
      </div>
      <Button type="submit" variant="secondary">
        Search
      </Button>
    </form>
  );
}
