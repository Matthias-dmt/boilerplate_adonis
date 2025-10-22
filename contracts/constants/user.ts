export const USER_SORT_FIELDS = ['created_at', 'email', 'last_login_at'] as const
export type UserSortField = (typeof USER_SORT_FIELDS)[number]

export const USER_DEFAULT_SORT: Readonly<{ field: UserSortField; direction: 'asc' | 'desc' }> = {
  field: 'created_at',
  direction: 'desc',
}
