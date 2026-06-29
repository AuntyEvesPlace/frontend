"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Sunrise, Sunset, UserRound } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { api } from "@/lib/api";
import { statusLogLabel } from "@/lib/attendance-status";
import type { AttendanceLog, AttendanceStatus } from "@/lib/types";
import { cn, formatDate, formatTime } from "@/lib/utils";

function LogIcon({ status }: { status: AttendanceStatus }) {
  if (status === "present_am") {
    return (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-maroon/10 text-maroon">
        <Sunrise className="h-3.5 w-3.5" />
      </div>
    );
  }
  if (status === "present_pm") {
    return (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-present-pm/15 text-present-pm">
        <Sunset className="h-3.5 w-3.5" />
      </div>
    );
  }
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 text-stone-400">
      <UserRound className="h-3.5 w-3.5" />
    </div>
  );
}

function LogMessage({ log }: { log: AttendanceLog }) {
  const label = statusLogLabel(log.status);
  return (
    <p className="min-w-0 flex-1 text-sm leading-snug text-stone-800">
      <span className="font-semibold text-maroon">{log.teacher_name}</span>
      {" marked "}
      {log.student_name}
      {" as "}
      <span
        className={cn(
          log.status === "absent" ? "text-muted" : "text-dark-red",
          log.status === "present_pm" && "text-present-pm",
        )}
      >
        {label}
      </span>
    </p>
  );
}

export function LogsPage() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query =
        from && to
          ? `/api/v1/attendance/logs?from=${from}&to=${to}`
          : "/api/v1/attendance/logs";
      const data = await api<AttendanceLog[]>(query);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const byDay = useMemo(() => {
    const map = new Map<string, AttendanceLog[]>();
    for (const log of logs) {
      const list = map.get(log.date) ?? [];
      list.push(log);
      map.set(log.date, list);
    }
    for (const [, entries] of map) {
      entries.sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    return [...map.entries()].sort(([a], [b]) => b.localeCompare(a));
  }, [logs]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance logs"
        description="Who marked whom, and when."
      />

      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="from-date">From</Label>
            <Input
              id="from-date"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to-date">To</Label>
            <Input
              id="to-date"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-11"
            />
          </div>
        </div>
        {(from || to) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-dark-red"
            onClick={() => {
              setFrom("");
              setTo("");
            }}
          >
            Clear dates
          </Button>
        )}
      </div>

      {loading ? (
        <ListSkeleton count={2} itemClassName="h-28" />
      ) : byDay.length === 0 ? (
        <EmptyState
          title="No logs yet"
          description={
            from || to
              ? "Nothing in this date range. Try clearing the filters."
              : "Activity will show up here when attendance is marked."
          }
        />
      ) : (
        <div className="max-h-[calc(100vh-16rem)] space-y-4 overflow-y-auto pb-2">
          {byDay.map(([day, entries]) => (
            <Card key={day} className="border-red-100">
              <CardHeader className="gap-0.5 border-b border-red-50 pb-3">
                <CardTitle className="text-sm font-semibold">{formatDate(day)}</CardTitle>
                <p className="text-xs text-muted">
                  {entries.length} {entries.length === 1 ? "entry" : "entries"}
                </p>
              </CardHeader>

              <CardContent className="px-4 pb-3 pt-4">
                <ul className="space-y-0.5">
                  {entries.map((log, index) => (
                    <li key={log.id} className="flex min-h-11 items-stretch">
                      <div className="flex w-5 shrink-0 flex-col items-center">
                        {index > 0 ? (
                          <div className="w-px flex-1 bg-red-200/80" aria-hidden />
                        ) : (
                          <div className="flex-1" aria-hidden />
                        )}
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-dark-red bg-white"
                          aria-hidden
                        />
                        {index < entries.length - 1 ? (
                          <div className="w-px flex-1 bg-red-200/80" aria-hidden />
                        ) : (
                          <div className="flex-1" aria-hidden />
                        )}
                      </div>

                      <div className="flex min-w-0 flex-1 items-center gap-2.5 py-2 pl-3 sm:gap-3">
                        <LogIcon status={log.status} />
                        <time
                          dateTime={log.created_at}
                          className="w-12 shrink-0 text-[11px] tabular-nums text-muted sm:w-14"
                        >
                          {formatTime(log.created_at)}
                        </time>
                        <LogMessage log={log} />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
