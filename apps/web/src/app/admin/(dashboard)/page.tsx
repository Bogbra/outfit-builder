import { ErrorState } from "@outfit-builder/ui";

import { getAdminAnalytics } from "@/features/admin/api/get-analytics";
import { AnalyticsCards } from "@/features/admin/components/analytics-cards";

export default async function AdminDashboardPage() {
  let analytics;

  try {
    analytics = await getAdminAnalytics();
  } catch {
    return (
      <main className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col px-4 py-8 sm:px-6 md:px-8">
        <ErrorState description="We couldn't load the dashboard analytics. Please try again shortly." />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 md:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold text-foreground">Dashboard</h1>
        <p className="max-w-prose text-base text-muted-foreground">
          An overview of the catalog and saved outfits.
        </p>
      </header>

      <AnalyticsCards analytics={analytics} />
    </main>
  );
}
