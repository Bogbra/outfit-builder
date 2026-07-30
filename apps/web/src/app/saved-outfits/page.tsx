import { EmptyState, ErrorState } from "@outfit-builder/ui";

import { getSavedOutfits } from "@/features/outfit-builder/api/get-saved-outfits";
import { SavedOutfitCard } from "@/features/outfit-builder/components/saved-outfit-card";

export default async function SavedOutfitsPage() {
  let outfitsPage;

  try {
    outfitsPage = await getSavedOutfits();
  } catch {
    return (
      <main className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col px-4 py-8 sm:px-6 md:px-8">
        <ErrorState description="We couldn't load your saved outfits. Please try again shortly." />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 md:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold text-foreground">Saved outfits</h1>
        <p className="max-w-prose text-base text-muted-foreground">Outfits you&apos;ve saved from the builder.</p>
      </header>

      {outfitsPage.items.length === 0 ? (
        <EmptyState title="No saved outfits yet" description="Build an outfit and save it to see it here." />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {outfitsPage.items.map((outfit) => (
            <SavedOutfitCard key={outfit.id} outfit={outfit} />
          ))}
        </div>
      )}
    </main>
  );
}
