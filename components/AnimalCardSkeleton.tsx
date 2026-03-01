export function AnimalCardSkeleton() {
  return (
    <article className="flex gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/95">
      <div className="h-24 w-24 shrink-0 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-700" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-3 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="flex gap-2 pt-2">
          <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-8 w-20 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
    </article>
  );
}
