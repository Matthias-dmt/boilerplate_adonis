import vine from '@vinejs/vine'

export const userCreateValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(8).maxLength(128),
    firstName: vine.string().trim().minLength(1),
    lastName: vine.string().trim().minLength(1),
    isActive: vine.boolean().optional(),
  })
)
