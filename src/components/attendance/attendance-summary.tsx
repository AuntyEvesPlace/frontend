import { Clock3, Clock9, School, Users, Utensils } from "lucide-react";
import type { AttendanceCounts } from "@/lib/attendance-counts";
import { cn } from "@/lib/utils";

export type CategoryFilter =
  | "packed_lunch"
  | "absent_to_school"
  | "present_am"
  | "present_pm"
  | null;

type Tone = "neutral" | "maroon" | "stone" | "pm";

const TONE_IDLE: Record<Tone, string> = {
  neutral: "text-stone-800",
  maroon: "text-maroon",
  stone: "text-stone-700",
  pm: "text-present-pm",
};

const TONE_ACTIVE: Record<Tone, string> = {
  neutral: "border-stone-700 bg-stone-700 text-white shadow-sm",
  maroon: "border-maroon bg-maroon text-white shadow-sm",
  stone: "border-stone-700 bg-stone-700 text-white shadow-sm",
  pm: "border-present-pm bg-present-pm text-white shadow-sm",
};

/**
 * One metric tile used across both modes. Static when no onClick is given,
 * tappable filter when onClick is provided.
 */
function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  active,
  onClick,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  tone: Tone;
  active?: boolean;
  onClick?: () => void;
}) {
  const body = (
    <>
      <p
        className={cn(
          "text-3xl font-semibold tabular-nums leading-none sm:text-4xl",
          active ? "text-inherit" : TONE_IDLE[tone],
        )}
      >
        {value}
      </p>
      <div className="mt-2 flex items-center gap-1.5">
        <Icon
          className={cn("h-4 w-4 shrink-0", active ? "text-inherit" : TONE_IDLE[tone])}
          aria-hidden
        />
        <p
          className={cn(
            "truncate text-xs font-semibold sm:text-sm",
            active ? "text-inherit" : "text-stone-800",
          )}
        >
          {label}
        </p>
      </div>
    </>
  );

  if (!onClick) {
    return (
      <div className="rounded-xl border border-red-100 bg-white px-3 py-3 sm:px-4">
        {body}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={
        active ? `${label}: ${value}. Showing list. Tap to clear.` : `${label}: ${value}. Tap to show list.`
      }
      className={cn(
        "rounded-xl border px-3 py-3 text-left transition-colors active:scale-[0.98] sm:px-4",
        active ? TONE_ACTIVE[tone] : "border-red-100 bg-white hover:border-maroon/40 hover:bg-maroon/[0.03]",
      )}
    >
      {body}
    </button>
  );
}

function ClassStatCard({
  className,
  counts,
  isHoliday,
}: {
  className: string;
  counts: AttendanceCounts;
  isHoliday: boolean;
}) {
  const shortName = className.replace(/^Standard /, "Std ");
  const cells = isHoliday
    ? [
        { value: counts.present, label: "Here", tone: "maroon" as Tone },
        { value: counts.am, label: "Before 12", tone: "maroon" as Tone },
        { value: counts.pm, label: "After 12", tone: "pm" as Tone },
      ]
    : [
        { value: counts.total, label: "Expected", tone: "neutral" as Tone },
        { value: counts.packedLunch, label: "Lunch", tone: "maroon" as Tone },
        { value: counts.absentToSchool, label: "No lunch", tone: "stone" as Tone },
      ];

  return (
    <div className="rounded-xl border border-red-100 bg-white px-3 py-2.5">
      <p className="truncate text-xs font-semibold uppercase tracking-wide text-dark-red">
        {shortName}
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {cells.map((cell) => (
          <div key={cell.label}>
            <p
              className={cn(
                "text-xl font-semibold tabular-nums leading-none sm:text-2xl",
                TONE_IDLE[cell.tone],
              )}
            >
              {cell.value}
            </p>
            <p className="mt-1 truncate text-[11px] font-medium text-stone-600">{cell.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AttendanceSummaryProps {
  totals: AttendanceCounts;
  byClass: { className: string; counts: AttendanceCounts }[];
  isToday: boolean;
  isHoliday: boolean;
  categoryFilter: CategoryFilter;
  onCategoryFilterChange: (next: CategoryFilter) => void;
}

export function AttendanceSummary({
  totals,
  byClass,
  isToday,
  isHoliday,
  categoryFilter,
  onCategoryFilterChange,
}: AttendanceSummaryProps) {
  const toggle = (category: Exclude<CategoryFilter, null>) => {
    onCategoryFilterChange(categoryFilter === category ? null : category);
  };

  return (
    <div className="space-y-4 rounded-xl border border-red-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-maroon">
            {isToday ? "Today" : "This day"}
          </h2>
          <p className="text-sm text-muted">
            {isHoliday ? "Holiday · mark who is here" : "School day · lunch and absences"}
          </p>
        </div>
        <span
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-semibold",
            isHoliday ? "bg-maroon text-white" : "bg-stone-100 text-stone-700",
          )}
        >
          {isHoliday ? "Holiday" : "School day"}
        </span>
      </div>

      {/* Metrics lead the panel in both modes. First tile is context, other two filter the list. */}
      <div className="grid grid-cols-3 gap-2.5">
        {isHoliday ? (
          <>
            <StatCard label="Present" value={totals.present} icon={Users} tone="neutral" />
            <StatCard
              label="Before 12"
              value={totals.am}
              icon={Clock9}
              tone="maroon"
              active={categoryFilter === "present_am"}
              onClick={() => toggle("present_am")}
            />
            <StatCard
              label="After 12"
              value={totals.pm}
              icon={Clock3}
              tone="pm"
              active={categoryFilter === "present_pm"}
              onClick={() => toggle("present_pm")}
            />
          </>
        ) : (
          <>
            <StatCard label="Expected" value={totals.total} icon={Users} tone="neutral" />
            <StatCard
              label="Packed lunch"
              value={totals.packedLunch}
              icon={Utensils}
              tone="maroon"
              active={categoryFilter === "packed_lunch"}
              onClick={() => toggle("packed_lunch")}
            />
            <StatCard
              label="No lunch"
              value={totals.absentToSchool}
              icon={School}
              tone="stone"
              active={categoryFilter === "absent_to_school"}
              onClick={() => toggle("absent_to_school")}
            />
          </>
        )}
      </div>

      {isHoliday && totals.total > 0 ? (
        <div className="space-y-1.5">
          <div
            className="flex h-2 overflow-hidden rounded-full bg-stone-100"
            role="progressbar"
            aria-valuenow={totals.present}
            aria-valuemin={0}
            aria-valuemax={totals.total}
            aria-label={`${totals.am} before noon, ${totals.pm} after noon, of ${totals.total} expected`}
          >
            <div
              className="h-full bg-maroon transition-[width] duration-300"
              style={{ width: `${(totals.am / totals.total) * 100}%` }}
            />
            <div
              className="h-full bg-present-pm transition-[width] duration-300"
              style={{ width: `${(totals.pm / totals.total) * 100}%` }}
            />
          </div>
          <p className="text-xs tabular-nums text-muted">
            {totals.present} of {totals.total} here
          </p>
        </div>
      ) : null}

      {byClass.length > 0 ? (
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">By class</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {byClass.map(({ className, counts }) => (
              <ClassStatCard
                key={className}
                className={className}
                counts={counts}
                isHoliday={isHoliday}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
