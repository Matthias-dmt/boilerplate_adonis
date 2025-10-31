import User from '#models/user'
import Factory from '@adonisjs/lucid/factories'

export default Factory.define(User, ({ faker }) => {
  return {
    email: faker.internet.email().toLowerCase(),
    password: 'Password!123', // plain text on purpose
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    isActive: true,
    role: 'customer',
    lastLoginAt: null,
    deletedAt: null,
  }
}).build()
