"use client";

import { useCallback, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import type { AttendanceDay } from "@/lib/types";

const POLL_INTERVAL_MS = 10_000;

export function useAttendancePoll(
  date: string,
  enabled: boolean,
  onRemote: (remote: AttendanceDay) => void,
) {
  const onRemoteRef = useRef(onRemote);
  onRemoteRef.current = onRemote;

  const poll = useCallback(async () => {
    try {
      const remote = await api<AttendanceDay>(`/api/v1/attendance?date=${date}`);
      onRemoteRef.current(remote);
    } catch {
      // Background sync — ignore transient errors
    }
  }, [date]);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      if (!document.hidden) poll();
    };

    const intervalId = window.setInterval(tick, POLL_INTERVAL_MS);

    const onVisibility = () => {
      if (!document.hidden) poll();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, poll]);
}
