import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { createReportInputSchema } from '@/lib/schema'
import { getAuthSession } from './auth'
import {
  fetchLandingStats,
  processCitizenReport,
} from '@/server/services/reports'
import { checkRateLimit, extractClientIp } from '@/server/services/rate-limit'

/**
 * Server Function yang dipanggil oleh SSR Loader di rute '/'.
 */
export const getLandingStats = createServerFn({ method: 'GET' }).handler(
  async () => {
    return fetchLandingStats()
  },
)

/**
 * Logika pemrosesan laporan warga dengan proteksi pembatasan laju IP (Plan 06).
 */
export async function processCitizenReportWithRateLimit(
  data: Parameters<typeof processCitizenReport>[0],
  reporterUserId: string | null,
  clientIp: string = '127.0.0.1',
) {
  const rateLimit = checkRateLimit(clientIp, 'report_submission')
  if (!rateLimit.allowed) {
    throw new Error(
      `RATE_LIMIT_EXCEEDED: Anda telah mengirim beberapa laporan dalam waktu singkat. Harap tunggu ${rateLimit.retryAfterSeconds} detik sebelum mengirim laporan berikutnya.`,
    )
  }

  return processCitizenReport(data, reporterUserId)
}

/**
 * Server Function pengiriman formulir pelaporan warga.
 * Dipanggil dari browser saat warga menekan tombol 'Kirim Laporan'.
 */
export const submitCitizenReport = createServerFn({ method: 'POST' })
  .validator((data: unknown) => createReportInputSchema.parse(data))
  .handler(async ({ data }) => {
    let clientIp = '127.0.0.1'
    try {
      const req = getRequest()
      if (req) {
        clientIp = extractClientIp(req)
      }
    } catch {
      // Fallback aman jika dipanggil di luar konteks request (misal: pengujian unit)
    }

    let reporterUserId: string | null = null

    try {
      const session = await getAuthSession()
      if (session) {
        reporterUserId = session.user.id
      }
    } catch {
      // Tidak masalah jika sesi tidak ada (pelapor publik tanpa akun)
    }

    return processCitizenReportWithRateLimit(data, reporterUserId, clientIp)
  })
