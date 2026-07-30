"use client";

import { Button, ErrorState } from "@outfit-builder/ui";
import { useEffect } from "react";

export default function CatalogError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col px-4 py-8 sm:px-6 md:px-8">
      <ErrorState
        description="Something unexpected happened while loading this page."
        action={
          <Button variant="secondary" onClick={reset}>
            Try again
          </Button>
        }
      />
    </main>
  );
}
