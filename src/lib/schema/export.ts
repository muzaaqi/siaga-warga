import { z } from 'zod'

/**
 * Format berkas ekspor data insiden untuk interoperabilitas instansi.
 */
export const exportFormatEnum = z.enum(['csv', 'geojson'])
export type ExportFormat = z.infer<typeof exportFormatEnum>

/**
 * Rentang waktu laporan yang diekspor.
 */
export const exportTimeRangeEnum = z.enum(['24h', '7d', '30d', 'all'])
export type ExportTimeRange = z.infer<typeof exportTimeRangeEnum>

/**
 * Parameter kueri ekspor data insiden.
 */
export const exportReportsQuerySchema = z.object({
  format: exportFormatEnum.default('csv'),
  verificationStatus: z
    .enum([
      'all',
      'pending',
      'needs_review',
      'verified',
      'insufficient_evidence',
      'rejected',
    ])
    .default('verified'),
  incidentType: z
    .enum(['all', 'karhutla', 'permukiman', 'industri', 'lainnya'])
    .default('all'),
  timeRange: exportTimeRangeEnum.default('7d'),
  limit: z.number().int().min(1).max(2000).default(500),
})
export type ExportReportsQuery = z.infer<typeof exportReportsQuerySchema>

/**
 * Skema respons muatan ekspor data insiden.
 */
export const exportDataResponseSchema = z.object({
  filename: z.string(),
  mimeType: z.string(),
  content: z.string(),
  totalRows: z.number().int().nonnegative(),
})
export type ExportDataResponse = z.infer<typeof exportDataResponseSchema>

/**
 * Struktur baris data laporan yang siap diformat menjadi CSV atau GeoJSON.
 */
export interface ExportReportRow {
  trackingCode: string
  incidentType: string
  description: string
  observedAt: Date | string
  submittedAt: Date | string
  latitude: number
  longitude: number
  addressDisplay: string | null
  verificationStatus: string
  priority: string
  handlingStatus: string
  satelliteHotspotMatched: boolean
  isPotentialDuplicate: boolean
  reporterName: string | null
  reporterPhone: string | null
  isAnonymous: boolean
  evidenceMediaUrl: string | null
}
