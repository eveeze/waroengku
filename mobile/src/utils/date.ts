/**
 * Format a Date to YYYY-MM-DD in the device's LOCAL timezone.
 *
 * ⚠️  NEVER use toISOString() for API date params — it returns UTC!
 *     Transactions between 00:00–06:59 WIB would be sent as the previous day.
 *
 * @example
 *   formatLocalDate(new Date()) // "2026-02-25" (based on device local time)
 */
export function formatLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
