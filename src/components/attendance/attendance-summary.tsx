import { Clock3, Clock9, Users } from "lucide-react";
import type { AttendanceCounts } from "@/lib/attendance-counts";
import { cn } from "@/lib/utils";

function StatBlock({
  label,
  value,
  sub,
  icon: Icon,
  accentClass,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: typeof Users;
  accentClass: string;
}) {
  return (
    <div className="rounded-lg border border-red-100 bg-white px-3 py-3 sm:px-4 sm:py-3.5">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-5 w-5 shrink-0", accentClass)} aria-hidden />
        <p className="text-sm font-medium text-stone-600">{label}</p>
      </div>
      <p className={cn("mt-1.5 text-3xl font-semibold tabular-nums sm:text-4xl", accentClass)}>
        {value}
        {sub ? <span className="text-lg font-normal text-stone-400">{sub}</span> : null}
      </p>
    </div>
  );
}

function ClassStatCard({ className, counts }: { className: string; counts: AttendanceCounts }) {
  const shortName = className.replace(/^Standard /, "Std ");
  return (
    <div className="rounded-lg border border-red-100 bg-white px-3 py-2.5">
      <p className="text-sm font-semibold text-dark-red">{shortName}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-maroon">
        {counts.present}
        <span className="text-base font-normal text-stone-400"> / {counts.total}</span>
      </p>
      <div className="mt-1.5 space-y-0.5 text-sm text-stone-600">
        <p className="tabular-nums">
          <span className="font-medium text-maroon">{counts.am}</span> before 12
        </p>
        <p className="tabular-nums">
          <span className="font-medium text-present-pm">{counts.pm}</span> after 12
        </p>
      </div>
    </div>
  );
}

interface AttendanceSummaryProps {
  totals: AttendanceCounts;
  byClass: { className: string; counts: AttendanceCounts }[];
  isToday: boolean;
}

export function AttendanceSummary({ totals, byClass, isToday }: AttendanceSummaryProps) {
  return (
    <div className="space-y-4 rounded-xl border border-red-100 bg-absent/40 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-maroon">
          {isToday ? "Today's counts" : "Day counts"}
        </h2>
        {isToday ? (
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-dark-red">
            Live
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <StatBlock
          label="Total present"
          value={totals.present}
          sub={` / ${totals.total}`}
          icon={Users}
          accentClass="text-maroon"
        />
        <StatBlock
          label="Before 12"
          value={totals.am}
          icon={Clock9}
          accentClass="text-maroon"
        />
        <StatBlock
          label="After 12"
          value={totals.pm}
          icon={Clock3}
          accentClass="text-present-pm"
        />
      </div>

      <div
        className="flex h-3 overflow-hidden rounded-full bg-stone-200"
        role="progressbar"
        aria-valuenow={totals.present}
        aria-valuemin={0}
        aria-valuemax={totals.total}
        aria-label={`${totals.am} before 12, ${totals.pm} after 12, ${totals.absent} absent out of ${totals.total}`}
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

      {byClass.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-medium text-stone-600">By class</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {byClass.map(({ className, counts }) => (
              <ClassStatCard key={className} className={className} counts={counts} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
