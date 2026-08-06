import Link from "next/link";

import { OutfitCountBadge } from "./outfit-count-badge";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between gap-4 px-4 py-4 sm:px-6 md:px-8">
        <Link
          href="/"
          className="rounded-md font-heading text-xl font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Outfit Builder
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1">
          <Link
            href="/outfit-builder"
            className="flex min-h-11 items-center gap-2 rounded-md px-4 text-base font-medium text-foreground transition-colors duration-200 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Outfit
            <OutfitCountBadge />
          </Link>
          <Link
            href="/saved-outfits"
            className="flex min-h-11 items-center rounded-md px-4 text-base font-medium text-foreground transition-colors duration-200 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Saved
          </Link>
        </nav>
      </div>
    </header>
  );
}
