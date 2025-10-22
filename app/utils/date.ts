/**
 * Convert Luxon DateTime, native Date, or string-like value to ISO string.
 * Returns null for undefined/null.
 */
export function toIso(value: any): string | null {
  if (value === null || value === undefined) return value
  if (typeof value.toISO === 'function') return value.toISO()
  if (value instanceof Date) return value.toISOString()
  return String(value)
}
