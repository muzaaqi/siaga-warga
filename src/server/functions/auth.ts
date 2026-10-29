import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { auth } from '@/server/auth'
import { db } from '@/server/db'
import { user } from '@/server/db/schema/auth'
import { eq } from 'drizzle-orm'
import type { SessionResponse } from '@/lib/schema/auth'

/**
 * Mengambil sesi pengguna saat ini di server (SSR / Server Function).
 */
export const getAuthSession = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SessionResponse> => {
    try {
      const request = getRequest()
      const session = await auth.api.getSession({
        headers: request.headers,
      })

      if (!session) return null
      return session as unknown as SessionResponse
    } catch {
      return null
    }
  },
)

/**
 * Memeriksa role pengguna langsung dari database Neon.
 */
async function verifyUserRole(userId: string): Promise<string | null> {
  const users = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (users.length === 0) {
    return null
  }

  return users[0].role
}

/**
 * Memvalidasi hak akses moderator secara ketat ke database Neon.
 */
export const requireModeratorSession = createServerFn({
  method: 'GET',
}).handler(async () => {
  const request = getRequest()
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    throw new Error('Autentikasi diperlukan.')
  }

  const role = await verifyUserRole(session.user.id)

  if (!role || (role !== 'moderator' && role !== 'superadmin')) {
    throw new Error('Akses ditolak: Anda tidak memiliki hak akses moderator.')
  }

  return session
})
