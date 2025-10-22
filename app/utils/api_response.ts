export const ok = <T>(data: T, meta: Record<string, unknown> = {}) => ({ data, meta })
export const err = (code: string, message: string, meta: Record<string, unknown> = {}) => ({
  error: { code, message },
  meta,
})
