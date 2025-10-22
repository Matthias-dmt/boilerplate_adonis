import vine, { errors } from '@vinejs/vine'

export function allowedSort(fields: readonly string[]) {
  return vine.createRule((value, _, field) => {
    if (value === null || value === '') return
    const parts = String(value).split(',')
    for (const p of parts) {
      const [rawField, rawDir] = p.split(':')
      const f = rawField?.trim()
      const d = (rawDir ?? 'asc').trim().toLowerCase()
      if (!fields.includes(f)) {
        throw new errors.E_VALIDATION_ERROR(`Invalid sort field: ${f}`, 'sort.field', field)
      }
      if (d !== 'asc' && d !== 'desc') {
        throw new errors.E_VALIDATION_ERROR(`Invalid sort direction: ${d}`, 'sort.direction', field)
      }
    }
  })
}
