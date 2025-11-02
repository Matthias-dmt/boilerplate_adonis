import { UserRepository } from '#repositories/user_repository'
import { UserService } from '#services/user_service'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  public async run() {
    const svc = new UserService()
    const repo = new UserRepository()
    const email = process.env.ADMIN_EMAIL ?? 'admin@example.com'
    const password = process.env.ADMIN_PASSWORD ?? 'helloWorld'
    const firstName = 'Admin'
    const lastName = 'User'
    try {
      // await svc.create({ email, password, firstName, lastName, isActive: true, role })

      const existing = await repo.findByEmail(email)
      if (existing) {
        await svc.update(existing.id, { role: 'super_admin', password })
      } else {
        await svc.create({
          email,
          password,
          firstName,
          lastName,
          isActive: true,
          role: 'super_admin',
        })
      }
    } catch (error) {
      console.error('Admin user seeding failed: ', error)
    }
  }
}
