import { UserService } from '#services/user_service'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  public async run() {
    const svc = new UserService()
    const email = process.env.ADMIN_EMAIL ?? 'admin@example.com'
    const password = process.env.ADMIN_PASSWORD ?? 'helloWorld'
    const firstName = 'Admin'
    const lastName = 'User'
    try {
      await svc.create({ email, password, firstName, lastName, isActive: true })
    } catch {}
  }
}
