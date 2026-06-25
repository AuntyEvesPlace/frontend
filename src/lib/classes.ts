"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

let cached: string[] | null = null;

export function useClasses() {
  const [classes, setClasses] = useState<string[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (cached) return;
    api<string[]>("/api/v1/classes")
      .then((data) => {
        cached = data;
        setClasses(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return { classes, loading };
}

export function sortByClassOrder(classes: string[], order: string[]): string[] {
  const rank = new Map(order.map((c, i) => [c, i]));
  return [...classes].sort(
    (a, b) => (rank.get(a) ?? 999) - (rank.get(b) ?? 999) || a.localeCompare(b),
  );
}
