import { COOLING_OFF_DAYS } from './constants';

/** Returns an ISO string for N days from now. */
export function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

/** Returns the cooling-off expiry date (7 days from now). */
export function getCoolingOffExpiry(): string {
  return daysFromNow(COOLING_OFF_DAYS);
}

/** Returns true if the given ISO date string is in the past. */
export function isExpired(isoDate: string): boolean {
  return new Date(isoDate).getTime() < Date.now();
}

/** Returns days remaining until the given ISO date. 0 if already past. */
export function daysRemaining(isoDate: string): number {
  const diff = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/** Checks if a date falls within a given range (inclusive). */
export function isInDateRange(
  date: string | Date,
  start: string | Date,
  end: string | Date,
): boolean {
  const d = new Date(date).getTime();
  return d >= new Date(start).getTime() && d <= new Date(end).getTime();
}

/** Formats a date for display: "Jan 14, 2024". */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
