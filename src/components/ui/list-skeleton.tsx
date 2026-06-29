import { cn } from "@/lib/utils";

export function ListSkeleton({
  count = 3,
  className,
  itemClassName,
}: {
  count?: number;
  className?: string;
  itemClassName?: string;
}) {
  return (
    <div className={cn("space-y-2.5", className)} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={cn("animate-pulse rounded-lg bg-stone-100", itemClassName ?? "h-16")}
        />
      ))}
    </div>
  );
}
