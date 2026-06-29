import { cn } from "@/lib/utils";

export function ErrorBanner({ message, className }: { message: string; className?: string }) {
  return (
    <p
      role="alert"
      className={cn(
        "rounded-lg border border-red-200 bg-absent px-3 py-2.5 text-sm text-dark-red",
        className,
      )}
    >
      {message}
    </p>
  );
}
