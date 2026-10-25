// Request-time date helpers for server components (each render is one request,
// so reading the clock here is intended). Kept out of component bodies so the
// React purity lint can tell render logic from clock reads.

const DAY = 86_400_000;

export function daysAgo(days: number) {
  return new Date(Date.now() - days * DAY);
}

/** yyyy-mm-dd for today in India time (IST, UTC+5:30). */
export function istTodayISO() {
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

/** First day of the current month (server time). */
export function monthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}
