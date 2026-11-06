import { z } from 'zod'
import type { UserRole } from './auth'
import { userRoleEnum } from './auth'

export type { UserRole }
export { userRoleEnum }

/**
 * Parameter kueri pencarian dan penyaringan daftar pengguna superadmin.
 */
export const adminUsersQuerySchema = z.object({
  search: z.string().default(''),
  role: z.enum(['all', 'citizen', 'moderator', 'superadmin']).default('all'),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
})
export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>

/**
 * Item pengguna untuk antarmuka tabel/kartu manajemen superadmin.
 */
export const adminUserItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  image: z.string().nullable(),
  role: userRoleEnum,
  createdAt: z.date(),
  reportsCount: z.number().int().nonnegative(),
  moderationActionsCount: z.number().int().nonnegative(),
})
export type AdminUserItem = z.infer<typeof adminUserItemSchema>

/**
 * Statistik agregat kuota peran pengguna terdaftar.
 */
export const userRoleStatsSchema = z.object({
  totalUsers: z.number().int().nonnegative(),
  citizenCount: z.number().int().nonnegative(),
  moderatorCount: z.number().int().nonnegative(),
  superadminCount: z.number().int().nonnegative(),
})
export type UserRoleStats = z.infer<typeof userRoleStatsSchema>

/**
 * Respons lengkap kueri daftar pengguna superadmin.
 */
export const adminUsersResponseSchema = z.object({
  users: z.array(adminUserItemSchema),
  totalCount: z.number().int().nonnegative(),
  stats: userRoleStatsSchema,
})
export type AdminUsersResponse = z.infer<typeof adminUsersResponseSchema>

/**
 * Skema masukan mutasi peran akun pengguna oleh superadmin.
 */
export const updateUserRoleInputSchema = z.object({
  targetUserId: z.string().min(1, 'ID pengguna target wajib disertakan.'),
  newRole: userRoleEnum,
  reasonNote: z
    .string()
    .trim()
    .min(10, 'Catatan alasan mutasi peran minimal 10 karakter.')
    .max(500, 'Catatan alasan maksimal 500 karakter.'),
})
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleInputSchema>
