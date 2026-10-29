import { createServerFn } from '@tanstack/react-start'
import { updateProfileInputSchema } from '@/lib/schema/profile'
import {
  fetchMyProfileAndReports,
  fetchUpdateMyProfile,
} from '@/server/services/profile'
import { getAuthSession } from './auth'

/**
 * Server Function GET untuk mengambil profil & laporan saya.
 * Dipanggil oleh SSR Loader di rute '/profil'.
 */
export const getMyProfileAndReports = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await getAuthSession()
    if (!session?.user) {
      throw new Error('Tidak terautentikasi')
    }
    return fetchMyProfileAndReports(session.user.id)
  },
)

/**
 * Server Function POST untuk memperbarui profil saya.
 * Dipanggil oleh form edit profil.
 */
export const updateMyProfile = createServerFn({ method: 'POST' })
  .validator((input: unknown) => updateProfileInputSchema.parse(input))
  .handler(async ({ data }) => {
    const session = await getAuthSession()
    if (!session?.user) {
      throw new Error('Tidak terautentikasi')
    }
    return fetchUpdateMyProfile(session.user.id, data)
  })
