export type Sort = { field: string; direction: 'asc' | 'desc' }

export function parsePagination(page?: any, perPage?: any) {
  const p = Math.max(1, Number(page) || 1)
  const pp = Math.min(100, Math.max(1, Number(perPage) || 20))
  return { page: p, perPage: pp }
}

export function parseSort(
  raw: string | undefined,
  allowed: readonly string[],
  fallback?: Sort
): Sort[] {
  if (!raw || !raw.trim()) return fallback ? [fallback] : []
  const set = new Set(allowed)
  return raw
    .split(',')
    .map((p) => {
      const [f0, d0] = p.split(':')
      const field = f0?.trim()
      const direction = (d0 ?? 'asc').trim().toLowerCase() === 'desc' ? 'desc' : 'asc'
      if (!field || !set.has(field)) return null
      return { field, direction }
    })
    .filter(Boolean) as Sort[]
}
