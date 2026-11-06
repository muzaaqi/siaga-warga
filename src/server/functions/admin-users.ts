import { createServerFn } from '@tanstack/react-start'
import type {
  AdminUsersResponse,
  AdminUserItem,
} from '@/lib/schema/admin-users'
import {
  adminUsersQuerySchema,
  updateUserRoleInputSchema,
} from '@/lib/schema/admin-users'
import { requireSuperadminSession } from '@/server/functions/auth'
import {
  fetchAdminUsersList,
  executeUserRoleChange,
} from '@/server/services/admin-users'

/**
 * Server Function: Mengambil daftar pengguna dan statistik peran (Khusus Superadmin).
 */
export const getAdminUsersList = createServerFn({ method: 'GET' })
  .validator((data: unknown) => adminUsersQuerySchema.parse(data))
  .handler(async ({ data }): Promise<AdminUsersResponse> => {
    await requireSuperadminSession()
    return fetchAdminUsersList(data)
  })

/**
 * Server Function: Mengubah peran akun pengguna (Khusus Superadmin).
 */
export const changeUserRole = createServerFn({ method: 'POST' })
  .validator((data: unknown) => updateUserRoleInputSchema.parse(data))
  .handler(
    async ({
      data,
    }): Promise<{ success: boolean; updatedUser: AdminUserItem }> => {
      const session = await requireSuperadminSession()
      return executeUserRoleChange(session.user.id, data)
    },
  )
