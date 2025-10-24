import crypto from 'node:crypto'

export function generatePlainRefreshToken(): string {
  // 48 bytes random => base64url => ~64 chars. Good entropy.
  return crypto.randomBytes(48).toString('base64url')
}

export function hashRefreshToken(plain: string): string {
  // SHA-256 is fine for refresh token storage (they are high entropy random secrets),
  // we don't need slow hashing like argon2 here.
  return crypto.createHash('sha256').update(plain).digest('hex')
}
