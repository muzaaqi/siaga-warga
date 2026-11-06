import { createServerFn } from '@tanstack/react-start'
import {
  getReportTrackingInputSchema,
  type ReportTrackingDetail,
} from '@/lib/schema/tracking'
import { fetchReportByTrackingCode } from '@/server/services/tracking'

/**
 * Server Function untuk mengambil detail laporan dan linimasa audit 4 fase publik
 * berdasarkan kode pelacakan unik.
 * Menegakkan Rule 1 (Zero direct DB access on client) dan Rule 7 (Zero PII leakage).
 */
export const getReportByTrackingCode = createServerFn({ method: 'GET' })
  .validator((input: unknown) => getReportTrackingInputSchema.parse(input))
  .handler(async ({ data }): Promise<ReportTrackingDetail | null> => {
    return fetchReportByTrackingCode(data.trackingCode)
  })
