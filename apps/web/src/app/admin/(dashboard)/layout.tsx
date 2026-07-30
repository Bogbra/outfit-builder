import Link from "next/link";

import { LogoutButton } from "@/features/admin/components/logout-button";

const NAV_LINK_CLASS =
  "flex min-h-11 items-center rounded-md px-4 text-base font-medium text-foreground transition-colors duration-200 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-screen-xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 md:px-8">
          <nav aria-label="Admin" className="flex items-center gap-1">
            <Link href="/admin" className={NAV_LINK_CLASS}>
              Dashboard
            </Link>
            <Link href="/admin/products" className={NAV_LINK_CLASS}>
              Products
            </Link>
          </nav>
          <LogoutButton />
        </div>
      </div>
      {children}
    </div>
  );
}
