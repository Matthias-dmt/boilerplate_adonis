import User from '#models/user'
import Factory from '@adonisjs/lucid/factories'

export default Factory.define(User, async ({ faker }) => {
  const password = await User.hashPassword('Password!123')
  return {
    email: faker.internet.email().toLowerCase(),
    password,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    isActive: true,
  }
}).build()
