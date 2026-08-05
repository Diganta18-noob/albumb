import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** `2026-01-17` → `17 JAN 2026`, the datestamp voice used across the site. */
export function stamp(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${String(d.getUTCDate()).padStart(2, "0")} ${months[d.getUTCMonth()] ?? ""} ${d.getUTCFullYear()}`;
}

/** `2025-11` → `NOVEMBER 2025`, for chapter headers. */
export function monthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split("-");
  const months = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
  ];
  const idx = Number(m) - 1;
  return `${months[idx] ?? ""} ${y ?? ""}`.trim();
}

/** Contact-sheet frame number: 7 → "07". */
export function frame(n: number | undefined): string {
  return String(n ?? 0).padStart(2, "0");
}

export function readingTime(words: number): string {
  return `${Math.max(1, Math.round(words / 220))} min read`;
}
