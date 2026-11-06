import { describe, expect, it } from 'bun:test'
import {
  adminUsersQuerySchema,
  adminUserItemSchema,
  userRoleStatsSchema,
  adminUsersResponseSchema,
  updateUserRoleInputSchema,
} from '@/lib/schema/admin-users'
import {
  validateRoleMutation,
  calculateUserRoleStats,
} from '@/server/services/admin-users'

describe('Superadmin User & Role Management (Plan 10)', () => {
  describe('Zod Isomorphic Schemas', () => {
    it('harus mengisi nilai default yang tepat pada adminUsersQuerySchema', () => {
      const parsed = adminUsersQuerySchema.parse({})
      expect(parsed.search).toBe('')
      expect(parsed.role).toBe('all')
      expect(parsed.limit).toBe(50)
      expect(parsed.offset).toBe(0)
    })

    it('harus menerima parameter kueri filter yang valid', () => {
      const parsed = adminUsersQuerySchema.parse({
        search: 'budi@gmail.com',
        role: 'moderator',
        limit: 25,
        offset: 5,
      })
      expect(parsed.search).toBe('budi@gmail.com')
      expect(parsed.role).toBe('moderator')
      expect(parsed.limit).toBe(25)
      expect(parsed.offset).toBe(5)
    })

    it('harus memvalidasi adminUserItemSchema dengan benar', () => {
      const sample = {
        id: 'usr-12345',
        name: 'Ahmad Dahlan',
        email: 'ahmad@example.com',
        image: 'https://lh3.googleusercontent.com/a/test',
        role: 'moderator',
        createdAt: new Date('2026-10-25T10:00:00.000Z'),
        reportsCount: 3,
        moderationActionsCount: 15,
      }

      const parsed = adminUserItemSchema.parse(sample)
      expect(parsed.id).toBe('usr-12345')
      expect(parsed.name).toBe('Ahmad Dahlan')
      expect(parsed.email).toBe('ahmad@example.com')
      expect(parsed.role).toBe('moderator')
      expect(parsed.reportsCount).toBe(3)
      expect(parsed.moderationActionsCount).toBe(15)
    })

    it('harus memvalidasi userRoleStatsSchema', () => {
      const stats = {
        totalUsers: 100,
        citizenCount: 90,
        moderatorCount: 8,
        superadminCount: 2,
      }
      const parsed = userRoleStatsSchema.parse(stats)
      expect(parsed.totalUsers).toBe(100)
      expect(parsed.citizenCount).toBe(90)
      expect(parsed.moderatorCount).toBe(8)
      expect(parsed.superadminCount).toBe(2)
    })

    it('harus memvalidasi adminUsersResponseSchema secara utuh', () => {
      const response = {
        users: [
          {
            id: 'usr-1',
            name: 'Budi',
            email: 'budi@example.com',
            image: null,
            role: 'citizen',
            createdAt: new Date(),
            reportsCount: 1,
            moderationActionsCount: 0,
          },
        ],
        totalCount: 1,
        stats: {
          totalUsers: 1,
          citizenCount: 1,
          moderatorCount: 0,
          superadminCount: 0,
        },
      }
      const parsed = adminUsersResponseSchema.parse(response)
      expect(parsed.users.length).toBe(1)
      expect(parsed.totalCount).toBe(1)
      expect(parsed.stats.totalUsers).toBe(1)
    })

    it('harus menerima input mutasi peran yang valid', () => {
      const input = {
        targetUserId: 'usr-target-1',
        newRole: 'moderator',
        reasonNote: 'Penugasan sebagai koordinator lapangan Damkar Kota Pekanbaru',
      }
      const parsed = updateUserRoleInputSchema.parse(input)
      expect(parsed.targetUserId).toBe('usr-target-1')
      expect(parsed.newRole).toBe('moderator')
      expect(parsed.reasonNote).toBe(
        'Penugasan sebagai koordinator lapangan Damkar Kota Pekanbaru',
      )
    })

    it('harus menolak catatan alasan mutasi peran yang kurang dari 10 karakter', () => {
      expect(() => {
        updateUserRoleInputSchema.parse({
          targetUserId: 'usr-target-1',
          newRole: 'moderator',
          reasonNote: 'pendek',
        })
      }).toThrow('Catatan alasan mutasi peran minimal 10 karakter.')
    })

    it('harus menolak nilai peran yang tidak valid', () => {
      expect(() => {
        updateUserRoleInputSchema.parse({
          targetUserId: 'usr-target-1',
          newRole: 'invalid_role',
          reasonNote: 'Alasan mutasi peran yang cukup panjang dan jelas',
        })
      }).toThrow()
    })
  })

  describe('Business Logic & Self-Demotion Lockout Guard', () => {
    it('harus mencegah superadmin mencopot peran superadmin miliknya sendiri (Lockout Protection)', () => {
      const currentSuperadminId = 'super-001'
      const targetUserId = 'super-001'
      const currentRole = 'superadmin'
      const newRole = 'citizen'

      expect(() => {
        validateRoleMutation(
          currentSuperadminId,
          targetUserId,
          currentRole,
          newRole,
        )
      }).toThrow(
        'Anda tidak dapat mencopot peran superadmin Anda sendiri demi keamanan sistem.',
      )
    })

    it('harus mencegah superadmin menurunkan perannya sendiri menjadi moderator', () => {
      const currentSuperadminId = 'super-001'
      const targetUserId = 'super-001'
      const currentRole = 'superadmin'
      const newRole = 'moderator'

      expect(() => {
        validateRoleMutation(
          currentSuperadminId,
          targetUserId,
          currentRole,
          newRole,
        )
      }).toThrow(
        'Anda tidak dapat mencopot peran superadmin Anda sendiri demi keamanan sistem.',
      )
    })

    it('harus mengizinkan superadmin memperbarui perannya sendiri jika peran tetap superadmin', () => {
      const currentSuperadminId = 'super-001'
      const targetUserId = 'super-001'
      const currentRole = 'superadmin'
      const newRole = 'superadmin'

      expect(() => {
        validateRoleMutation(
          currentSuperadminId,
          targetUserId,
          currentRole,
          newRole,
        )
      }).not.toThrow()
    })

    it('harus mengizinkan pengubahan peran pengguna lain dari citizen menjadi moderator', () => {
      const currentSuperadminId = 'super-001'
      const targetUserId = 'citizen-002'
      const currentRole = 'citizen'
      const newRole = 'moderator'

      expect(() => {
        validateRoleMutation(
          currentSuperadminId,
          targetUserId,
          currentRole,
          newRole,
        )
      }).not.toThrow()
    })

    it('harus mengizinkan penurunan peran pengguna lain dari moderator menjadi citizen', () => {
      const currentSuperadminId = 'super-001'
      const targetUserId = 'mod-003'
      const currentRole = 'moderator'
      const newRole = 'citizen'

      expect(() => {
        validateRoleMutation(
          currentSuperadminId,
          targetUserId,
          currentRole,
          newRole,
        )
      }).not.toThrow()
    })

    it('harus menghitung statistik peran secara akurat', () => {
      const rawUsers = [
        { role: 'superadmin' },
        { role: 'moderator' },
        { role: 'moderator' },
        { role: 'citizen' },
        { role: 'citizen' },
        { role: 'citizen' },
      ]

      const stats = calculateUserRoleStats(rawUsers)
      expect(stats.totalUsers).toBe(6)
      expect(stats.superadminCount).toBe(1)
      expect(stats.moderatorCount).toBe(2)
      expect(stats.citizenCount).toBe(3)
    })
  })
})
