import { USER_SORT_FIELDS } from '#contracts/constants/user'
import { allowedSort } from '#validators/rules/allowed_sort'
import vine from '@vinejs/vine'

export const userListQueryValidator = vine.compile(
  vine.object({
    page: vine.number().withoutDecimals().min(1).optional(),
    perPage: vine.number().withoutDecimals().min(1).max(100).optional(),
    search: vine.string().trim().optional(),
    sort: vine.string().trim().use(allowedSort(USER_SORT_FIELDS)()).optional(),
  })
)
