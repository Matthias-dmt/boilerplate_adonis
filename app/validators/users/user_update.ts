import vine from '@vinejs/vine'

export const userUpdateValidator = vine.compile(
  vine.object({
    email: vine.string().email().optional(),
    password: vine.string().minLength(8).maxLength(128).optional(),
    firstName: vine.string().trim().minLength(1).optional(),
    lastName: vine.string().trim().minLength(1).optional(),
    isActive: vine.boolean().optional(),
  })
)
