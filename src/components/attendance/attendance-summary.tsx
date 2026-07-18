import { Clock3, Clock9, School, Users, Utensils } from "lucide-react";
import type { AttendanceCounts } from "@/lib/attendance-counts";
import { cn } from "@/lib/utils";

export type CategoryFilter = "packed_lunch" | "absent_to_school" | null;

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  valueClass,
}: {
  label: string;
  value: number;
  hint?: string;
  icon: typeof Users;
  valueClass: string;
}) {
  return (
    <div className="rounded-xl border border-red-100 bg-white px-3 py-3 sm:px-4">
      <p className={cn("text-4xl font-semibold tabular-nums leading-none sm:text-5xl", valueClass)}>
        {value}
      </p>
      <div className="mt-2 flex items-center gap-1.5">
        <Icon className={cn("h-4 w-4 shrink-0", valueClass)} aria-hidden />
        <p className="text-sm font-semibold text-stone-800">{label}</p>
      </div>
      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

function FilterMetricCard({
  label,
  value,
  hint,
  icon: Icon,
  idleValueClass,
  active,
  activeClass,
  onClick,
}: {
  label: string;
  value: number;
  hint: string;
  icon: typeof Users;
  idleValueClass: string;
  active: boolean;
  activeClass: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={
        active
          ? `${label}: ${value}. Showing list. Tap to clear.`
          : `${label}: ${value}. Tap to show list.`
      }
      className={cn(
        "rounded-xl border px-3 py-3 text-left transition-colors active:scale-[0.99] sm:px-4",
        active
          ? activeClass
          : "border-red-100 bg-white hover:border-maroon/40 hover:bg-maroon/[0.03]",
      )}
    >
      <p
        className={cn(
          "text-4xl font-semibold tabular-nums leading-none sm:text-5xl",
          active ? "text-inherit" : idleValueClass,
        )}
      >
        {value}
      </p>
      <div className="mt-2 flex items-center gap-1.5">
        <Icon
          className={cn("h-4 w-4 shrink-0", active ? "text-inherit" : idleValueClass)}
          aria-hidden
        />
        <p className={cn("text-sm font-semibold", active ? "text-inherit" : "text-stone-800")}>
          {label}
        </p>
      </div>
      <p className={cn("mt-0.5 text-xs", active ? "opacity-80" : "text-muted")}>
        {active ? "Showing list · tap to clear" : hint}
      </p>
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
  return (
    <div className="rounded-xl border border-red-100 bg-white px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-dark-red">{shortName}</p>
        <p className="shrink-0 text-xs tabular-nums text-muted">
          <span className="font-semibold text-stone-600">{counts.total}</span> expected
        </p>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div>
          <p className="text-2xl font-semibold tabular-nums leading-none text-maroon sm:text-3xl">
            {counts.packedLunch}
          </p>
          <p className="mt-1 text-xs font-medium text-stone-600">Lunch</p>
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums leading-none text-stone-700 sm:text-3xl">
            {counts.absentToSchool}
          </p>
          <p className="mt-1 text-xs font-medium text-stone-600">No school</p>
        </div>
      </div>

      {isHoliday ? (
        <p className="mt-2 text-xs tabular-nums text-stone-500">
          <span className="font-semibold text-maroon">{counts.present}</span> here
          {" · "}
          <span className="font-semibold text-maroon">{counts.am}</span> before
          {" · "}
          <span className="font-semibold text-present-pm">{counts.pm}</span> after
        </p>
      ) : null}
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
  const toggleCategory = (category: Exclude<CategoryFilter, null>) => {
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
        <div className="flex items-center gap-2">
          {isHoliday ? (
            <span className="rounded-md bg-maroon px-2.5 py-1 text-xs font-semibold text-white">
              Holiday
            </span>
          ) : (
            <span className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
              School day
            </span>
          )}
          {isToday ? (
            <span className="rounded-md bg-absent px-2.5 py-1 text-xs font-semibold text-dark-red">
              Live
            </span>
          ) : null}
        </div>
      </div>

      {isHoliday ? (
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Who is here
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <MetricCard
              label="Present"
              value={totals.present}
              hint={`of ${totals.total} expected`}
              icon={Users}
              valueClass="text-maroon"
            />
            <MetricCard
              label="Before noon"
              value={totals.am}
              hint="Arrived before 12"
              icon={Clock9}
              valueClass="text-maroon"
            />
            <MetricCard
              label="After noon"
              value={totals.pm}
              hint="Arrived after 12"
              icon={Clock3}
              valueClass="text-present-pm"
            />
          </div>

          <div className="space-y-1.5 pt-1">
            <div
              className="flex h-2.5 overflow-hidden rounded-full bg-stone-100"
              role="progressbar"
              aria-valuenow={totals.present}
              aria-valuemin={0}
              aria-valuemax={totals.total}
              aria-label={`${totals.am} before noon, ${totals.pm} after noon, ${totals.absent} not here, of ${totals.total} expected`}
            >
              {totals.total > 0 ? (
                <>
                  <div
                    className="h-full bg-maroon transition-[width] duration-300"
                    style={{ width: `${(totals.am / totals.total) * 100}%` }}
                  />
                  <div
                    className="h-full bg-present-pm transition-[width] duration-300"
                    style={{ width: `${(totals.pm / totals.total) * 100}%` }}
                  />
                </>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-maroon" aria-hidden />
                Before noon
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-present-pm" aria-hidden />
                After noon
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-stone-200" aria-hidden />
                Not here
              </span>
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Tap to see names
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <FilterMetricCard
            label="Packed lunch"
            value={totals.packedLunch}
            hint="Tap to see names"
            icon={Utensils}
            idleValueClass="text-maroon"
            active={categoryFilter === "packed_lunch"}
            activeClass="border-maroon bg-maroon text-white shadow-sm"
            onClick={() => toggleCategory("packed_lunch")}
          />
          <FilterMetricCard
            label="No school"
            value={totals.absentToSchool}
            hint="Tap to see names"
            icon={School}
            idleValueClass="text-stone-700"
            active={categoryFilter === "absent_to_school"}
            activeClass="border-stone-700 bg-stone-700 text-white shadow-sm"
            onClick={() => toggleCategory("absent_to_school")}
          />
        </div>
      </section>

      {byClass.length > 0 ? (
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            By class
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
