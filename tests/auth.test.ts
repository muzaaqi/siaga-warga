import { describe, expect, it } from 'bun:test'
import {
  authUserSchema,
  authSessionSchema,
  userRoleEnum,
} from '@/lib/schema/auth'
import { db } from '@/server/db'
import { user } from '@/server/db/schema/auth'
import { eq } from 'drizzle-orm'

describe('Better Auth & Google OAuth Schemas & Logic', () => {
  describe('Zod Schemas', () => {
    it('harus menerima data pengguna Google OAuth yang valid', () => {
      const validUser = {
        id: 'usr_google_12345',
        name: 'Budi Santoso',
        email: 'budi.santoso@gmail.com',
        emailVerified: true,
        image: 'https://lh3.googleusercontent.com/a/ACg8ocL...',
        role: 'citizen' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const result = authUserSchema.safeParse(validUser)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('budi.santoso@gmail.com')
        expect(result.data.role).toBe('citizen')
        expect(result.data.createdAt).toBeInstanceOf(Date)
      }
    })

    it('harus mengisi default role citizen jika tidak dicantumkan', () => {
      const minimalUser = {
        id: 'usr_67890',
        name: 'Siti Rahma',
        email: 'siti@example.com',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = authUserSchema.safeParse(minimalUser)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.role).toBe('citizen')
      }
    })

    it('harus menolak format email yang tidak valid', () => {
      const invalidUser = {
        id: 'usr_invalid',
        name: 'User Palsu',
        email: 'bukan-email-valid',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = authUserSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
    })

    it('harus memvalidasi enum userRoleEnum secara ketat', () => {
      expect(userRoleEnum.safeParse('citizen').success).toBe(true)
      expect(userRoleEnum.safeParse('moderator').success).toBe(true)
      expect(userRoleEnum.safeParse('superadmin').success).toBe(true)
      expect(userRoleEnum.safeParse('admin').success).toBe(false)
      expect(userRoleEnum.safeParse('root').success).toBe(false)
    })

    it('harus memvalidasi session payload dengan token dan tanggal kedaluwarsa', () => {
      const validSession = {
        id: 'sess_123',
        userId: 'usr_google_12345',
        token: 'token_secret_hmac_abc',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        ipAddress: '103.10.12.34',
        userAgent: 'Mozilla/5.0 Chrome/120',
      }

      const result = authSessionSchema.safeParse(validSession)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.token).toBe('token_secret_hmac_abc')
        expect(result.data.expiresAt).toBeInstanceOf(Date)
      }
    })
  })

  describe('Database Integration (Neon PostgreSQL)', () => {
    it('harus dapat melakukan insert dan query tabel users di Neon DB', async () => {
      const testUserId = `test_${Date.now()}`
      const testEmail = `test.user.${Date.now()}@siagawarga.id`

      // Insert record uji coba
      await db.insert(user).values({
        id: testUserId,
        name: 'Petugas Uji Coba',
        email: testEmail,
        emailVerified: true,
        role: 'moderator',
      })

      // Query kembali
      const [fetchedUser] = await db
        .select()
        .from(user)
        .where(eq(user.id, testUserId))
        .limit(1)

      expect(fetchedUser).toBeDefined()
      expect(fetchedUser.name).toBe('Petugas Uji Coba')
      expect(fetchedUser.email).toBe(testEmail)
      expect(fetchedUser.role).toBe('moderator')

      // Bersihkan data uji coba
      await db.delete(user).where(eq(user.id, testUserId))

      // Verifikasi telah terhapus
      const [deletedCheck] = await db
        .select()
        .from(user)
        .where(eq(user.id, testUserId))
        .limit(1)
      expect(deletedCheck).toBeUndefined()
    })
  })
})
