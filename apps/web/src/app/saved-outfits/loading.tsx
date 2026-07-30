import { LoadingSkeleton } from "@outfit-builder/ui";

export default function SavedOutfitsLoading() {
  return (
    <main className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 md:px-8">
      <div className="flex flex-col gap-2">
        <LoadingSkeleton className="h-9 w-64" />
        <LoadingSkeleton className="h-6 w-96 max-w-full" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <LoadingSkeleton key={index} className="h-64 w-full" />
        ))}
      </div>
    </main>
  );
}
