/**
 * Pure helper functions for visitor analytics.
 *
 * @see Requirements 2.1, 2.2 — IP extraction and header priority
 */

/**
 * Extracts the client IP address from incoming request headers.
 *
 * Priority order:
 *   1. First comma-separated token from `x-forwarded-for` (trimmed)
 *   2. Value of `x-real-ip` (trimmed)
 *   3. The string `"unknown"` if neither header is present
 *
 * @param headers - The standard Web API `Headers` object from the incoming request
 * @returns The extracted IP address string, or `"unknown"` if not determinable
 *
 * @remarks Requirements 2.1, 2.2
 */
export function extractIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

/**
 * Determines whether an IP address is a local network or unknown address.
 *
 * Matches: `"unknown"`, `"127.0.0.1"`, `"::1"`, any address starting with
 * `"192.168."`, and any address starting with `"10."`.
 *
 * @param ip - The IP address string to test
 * @returns `true` if the IP is local or unknown; `false` otherwise
 *
 * @remarks Requirement 2.3
 */
export function isLocalOrUnknown(ip: string): boolean {
  return (
    ip === "unknown" ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.")
  );
}

/**
 * Sanitizes an IP address for use as a Firestore document ID by replacing every
 * `.` and `:` character with `_`.
 *
 * @example
 * sanitizeIp("192.168.1.1") // → "192_168_1_1"
 * sanitizeIp("::1")         // → "__1"
 *
 * @param ip - The raw IP address string (IPv4, IPv6, or `"unknown"`)
 * @returns The sanitized string with no `.` or `:` characters
 *
 * @remarks Requirement 2.4
 */
export function sanitizeIp(ip: string): string {
  return ip.replace(/[.:]/g, "_");
}

/**
 * Parses a browser product name from a User-Agent string.
 *
 * Checks are applied in strict priority order so that multi-token UA strings
 * (e.g. Edge and Chrome both contain `"Chrome/"`) are classified correctly:
 *
 * 1. Contains `"Edg/"`                             → `"Edge"`
 * 2. Contains `"Chrome/"`                          → `"Chrome"`
 * 3. Contains `"Firefox/"`                         → `"Firefox"`
 * 4. Contains `"Safari/"` AND NOT `"Chrome/"`      → `"Safari"`
 * 5. Contains `"OPR/"` OR `"Opera"`                → `"Opera"`
 * 6. Empty/falsy or no match                       → `"Other"`
 *
 * @param userAgent - The raw `User-Agent` header string
 * @returns The matched browser product name, or `"Other"` for unrecognised agents
 *
 * @remarks Requirements 7.1, 7.3
 */
export function parseBrowserName(userAgent: string): string {
  if (!userAgent) return "Other";

  if (userAgent.includes("Edg/")) return "Edge";
  if (userAgent.includes("Chrome/")) return "Chrome";
  if (userAgent.includes("Firefox/")) return "Firefox";
  if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) return "Safari";
  if (userAgent.includes("OPR/") || userAgent.includes("Opera")) return "Opera";

  return "Other";
}

// ---------------------------------------------------------------------------
// Shared data-model interfaces
// ---------------------------------------------------------------------------

/** A single document from the Firestore `visitors` collection. */
export interface VisitorRecord {
  id?: string;
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  region: string;
  lat: number;
  lon: number;
  isp: string;
  userAgent: string;
  firstSeen: string;
  lastSeen: string;
  visitCount: number;
  sessionIds: string[];
  resumeClicks?: number;
  entryTime?: string;
  exitTime?: string;
}

/** One entry in the country breakdown list. */
export interface CountryBreakdownEntry {
  country: string;
  count: number;
}

/** One entry in the browser breakdown list. */
export interface BrowserBreakdownEntry {
  browser: string;
  count: number;
}

/** A row in the recent-visitors table. */
export interface RecentVisitorRow {
  ip: string;
  country: string;
  city: string;
  browser: string;
  visitCount: number;
  lastSeen: string;
}

/** The full set of aggregate metrics rendered by the Analytics Dashboard. */
export interface AnalyticsMetrics {
  uniqueVisitorCount: number;
  totalVisitCount: number;
  countryBreakdown: CountryBreakdownEntry[];
  browserBreakdown: BrowserBreakdownEntry[];
  recentVisitors: RecentVisitorRow[];
}

/**
 * Computes aggregate analytics metrics from an array of visitor records.
 *
 * - `uniqueVisitorCount` — total number of records (one per unique IP)
 * - `totalVisitCount`    — sum of every record's `visitCount` field
 * - `countryBreakdown`   — top 5 countries by unique-visitor count, sorted desc
 * - `browserBreakdown`   — top 5 browsers by summed `visitCount`, sorted desc
 * - `recentVisitors`     — 10 most-recent records by `lastSeen` (ISO sort),
 *                          with `lastSeen` formatted as a human-readable relative
 *                          time string via {@link formatRelativeTime}
 *
 * @param records - Array of {@link VisitorRecord} objects fetched from Firestore
 * @returns A fully-computed {@link AnalyticsMetrics} object
 *
 * @remarks Requirements 6.2, 6.3, 6.4, 6.5, 7.2
 */
export function computeMetrics(records: VisitorRecord[]): AnalyticsMetrics {
  // Unique visitor count
  const uniqueVisitorCount = records.length;

  // Total visit count — sum all visitCount fields
  const totalVisitCount = records.reduce((sum, r) => sum + r.visitCount, 0);

  // Country breakdown — count records per country, top 5 desc
  const countryMap = new Map<string, number>();
  for (const r of records) {
    countryMap.set(r.country, (countryMap.get(r.country) ?? 0) + 1);
  }
  const countryBreakdown: CountryBreakdownEntry[] = Array.from(countryMap.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Browser breakdown — sum visitCount per browser group, top 5 desc
  const browserMap = new Map<string, number>();
  for (const r of records) {
    const browser = parseBrowserName(r.userAgent);
    browserMap.set(browser, (browserMap.get(browser) ?? 0) + r.visitCount);
  }
  const browserBreakdown: BrowserBreakdownEntry[] = Array.from(browserMap.entries())
    .map(([browser, count]) => ({ browser, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Recent visitors — 10 latest by lastSeen (ISO strings sort lexicographically)
  const recentVisitors: RecentVisitorRow[] = [...records]
    .sort((a, b) => (a.lastSeen < b.lastSeen ? 1 : a.lastSeen > b.lastSeen ? -1 : 0))
    .slice(0, 10)
    .map((r) => ({
      ip: r.ip || "unknown",
      country: r.country,
      city: r.city,
      browser: parseBrowserName(r.userAgent),
      visitCount: r.visitCount,
      lastSeen: formatRelativeTime(r.lastSeen),
    }));

  return { uniqueVisitorCount, totalVisitCount, countryBreakdown, browserBreakdown, recentVisitors };
}

/**
 * Formats an ISO 8601 timestamp as a human-readable relative time string.
 *
 * Conversion rules (based on elapsed milliseconds since the timestamp):
 * - `< 60 000 ms`       → `"just now"`
 * - `< 3 600 000 ms`    → `"X minutes ago"` (floor)
 * - `< 86 400 000 ms`   → `"X hours ago"` (floor)
 * - `≥ 86 400 000 ms`   → `"X days ago"` (floor)
 *
 * @param isoTimestamp - An ISO 8601 date-time string (e.g. `"2024-06-01T12:00:00.000Z"`)
 * @returns A relative time string suitable for display in the recent-visitors table
 *
 * @remarks Requirement 6.5
 */
export function formatRelativeTime(isoTimestamp: string): string {
  const diff = Date.now() - new Date(isoTimestamp).getTime();

  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} minutes ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hours ago`;
  return `${Math.floor(diff / 86_400_000)} days ago`;
}
