"use client";

import { useState } from "react";
import { CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { cn, todayIso } from "@/lib/utils";

interface CenterDayResponse {
  date: string;
  is_holiday: boolean;
}

interface CenterDayRangeResult {
  from_date: string;
  to_date: string;
  is_holiday: boolean;
  updated_days: number;
}

interface HolidayControlsProps {
  date: string;
  isHoliday: boolean;
  isAdmin: boolean;
  /** When false, only the range dialog is shown (no single-day toggle). */
  allowDayToggle?: boolean;
  onHolidayChange: (isHoliday: boolean) => void;
  onError: (message: string) => void;
}

export function HolidayControls({
  date,
  isHoliday,
  isAdmin,
  allowDayToggle = true,
  onHolidayChange,
  onError,
}: HolidayControlsProps) {
  const [pending, setPending] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [rangeFrom, setRangeFrom] = useState(date);
  const [rangeTo, setRangeTo] = useState(date);
  const [rangePending, setRangePending] = useState(false);

  const toggleHoliday = async () => {
    if (!isAdmin || pending) return;
    const next = !isHoliday;
    setPending(true);
    onError("");
    try {
      const res = await api<CenterDayResponse>("/api/v1/center-days", {
        method: "PUT",
        body: JSON.stringify({ date, is_holiday: next }),
      });
      onHolidayChange(res.is_holiday);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Failed to update holiday");
    } finally {
      setPending(false);
    }
  };

  const applyRange = async (markHoliday: boolean) => {
    if (!isAdmin || rangePending) return;
    if (!rangeFrom || !rangeTo || rangeTo < rangeFrom) {
      onError("Choose a valid from/to date range");
      return;
    }
    setRangePending(true);
    onError("");
    try {
      await api<CenterDayRangeResult>("/api/v1/center-days/range", {
        method: "PUT",
        body: JSON.stringify({
          from_date: rangeFrom,
          to_date: rangeTo,
          is_holiday: markHoliday,
        }),
      });
      if (date >= rangeFrom && date <= rangeTo) {
        onHolidayChange(markHoliday);
      }
      setRangeOpen(false);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Failed to update holiday range");
    } finally {
      setRangePending(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {allowDayToggle ? (
          <button
            type="button"
            disabled={pending}
            aria-pressed={isHoliday}
            onClick={toggleHoliday}
            className={cn(
              "inline-flex h-9 items-center rounded-full border px-3 text-sm font-semibold transition-colors active:scale-[0.98] disabled:opacity-60",
              isHoliday
                ? "border-maroon bg-maroon text-white"
                : "border-border bg-white text-stone-600 hover:bg-stone-50",
            )}
          >
            {isHoliday ? "Holiday on" : "Holiday off"}
          </button>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-9 gap-1.5"
          onClick={() => {
            setRangeFrom(date);
            setRangeTo(date);
            setRangeOpen(true);
          }}
        >
          <CalendarRange className="h-4 w-4" />
          Set range
        </Button>
      </div>

      <Dialog open={rangeOpen} onOpenChange={setRangeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set holiday range</DialogTitle>
            <DialogDescription>
              Mark or clear holiday mode for every day in the range (inclusive).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="holiday-from">From</Label>
              <Input
                id="holiday-from"
                type="date"
                value={rangeFrom}
                onChange={(e) => setRangeFrom(e.target.value || todayIso())}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="holiday-to">To</Label>
              <Input
                id="holiday-to"
                type="date"
                value={rangeTo}
                min={rangeFrom}
                onChange={(e) => setRangeTo(e.target.value || rangeFrom)}
                className="h-11"
              />
            </div>
            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <Button
                type="button"
                className="h-11 flex-1"
                disabled={rangePending}
                onClick={() => applyRange(true)}
              >
                Mark holiday
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-11 flex-1"
                disabled={rangePending}
                onClick={() => applyRange(false)}
              >
                Clear holiday
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
