import { createServerFn } from '@tanstack/react-start'
import { createReportInputSchema } from '@/lib/schema'
import { getAuthSession } from './auth'
import {
  fetchLandingStats,
  processCitizenReport,
} from '@/server/services/reports'

/**
 * Server Function yang dipanggil oleh SSR Loader di rute '/'.
 */
export const getLandingStats = createServerFn({ method: 'GET' }).handler(
  async () => {
    return fetchLandingStats()
  },
)

/**
 * Server Function pengiriman formulir pelaporan warga.
 * Dipanggil dari browser saat warga menekan tombol 'Kirim Laporan'.
 */
export const submitCitizenReport = createServerFn({ method: 'POST' })
  .validator((data: unknown) => createReportInputSchema.parse(data))
  .handler(async ({ data }) => {
    let reporterUserId: string | null = null

    try {
      const session = await getAuthSession()
      if (session) {
        reporterUserId = session.user.id
      }
    } catch {
      // Tidak masalah jika sesi tidak ada (pelapor publik tanpa akun)
    }

    return processCitizenReport(data, reporterUserId)
  })
