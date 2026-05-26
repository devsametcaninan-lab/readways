export default function SavedWordsSkeleton() {
  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="mb-8 space-y-3">
        <div className="h-8 w-48 animate-pulse rounded-md bg-white/[0.06]" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-white/[0.04]" />
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <div className="h-11 flex-1 animate-pulse rounded-lg bg-white/[0.05] sm:max-w-md" />
        <div className="h-11 w-full animate-pulse rounded-lg bg-white/[0.05] sm:w-80" />
      </div>

      <div className="space-y-10">
        <div className="space-y-4">
          <div className="h-3 w-40 animate-pulse rounded bg-white/[0.05]" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-56 animate-pulse rounded-xl border border-white/[0.08] bg-[#12141d]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
