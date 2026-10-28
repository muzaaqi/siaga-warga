import { z } from 'zod'

export const incidentTypeEnum = z.enum([
  'karhutla',
  'permukiman',
  'industri',
  'lainnya',
])

export const verificationStatusEnum = z.enum([
  'pending',
  'needs_review',
  'verified',
  'insufficient_evidence',
  'rejected',
])

export const priorityEnum = z.enum(['high', 'normal', 'low'])

export const handlingStatusEnum = z.enum([
  'not_forwarded',
  'forwarded',
  'acknowledged',
  'in_progress',
  'resolved',
  'unknown',
])

export const createReportInputSchema = z.object({
  incidentType: incidentTypeEnum,
  description: z
    .string()
    .min(15, 'Deskripsi kejadian minimal 15 karakter agar informatif')
    .max(1000, 'Deskripsi kejadian maksimal 1000 karakter'),
  observedAt: z.string().datetime({
    message: 'Waktu kejadian harus berupa format ISO datetime yang valid',
  }),
  latitude: z
    .number()
    .min(-11, 'Koordinat lintang di luar batas wilayah Indonesia')
    .max(6, 'Koordinat lintang di luar batas wilayah Indonesia'),
  longitude: z
    .number()
    .min(95, 'Koordinat bujur di luar batas wilayah Indonesia')
    .max(141, 'Koordinat bujur di luar batas wilayah Indonesia'),
  addressDisplay: z.string().max(255).optional(),

  // Mandatory photo proof (Rule 4 & PRD 5.1)
  r2ObjectKey: z.string().min(1, 'Foto bukti wajib diunggah'),
  fileHashSha256: z
    .string()
    .length(64, 'Hash bukti foto tidak valid')
    .optional(),
  exifCaptureTime: z.string().optional(),

  // Reporter info (Optional)
  reporterName: z.string().max(100).optional(),
  reporterPhone: z
    .string()
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, 'Nomor telepon tidak valid')
    .optional()
    .or(z.literal('')),
  isAnonymous: z.boolean().default(false),
})

export type CreateReportInput = z.infer<typeof createReportInputSchema>
export type IncidentType = z.infer<typeof incidentTypeEnum>
export type VerificationStatus = z.infer<typeof verificationStatusEnum>
export type Priority = z.infer<typeof priorityEnum>
export type HandlingStatus = z.infer<typeof handlingStatusEnum>

/**
 * Respon hasil pengiriman laporan warga (Plan 03).
 */
export const submitReportResponseSchema = z.object({
  reportId: z.string().uuid(),
  trackingCode: z.string(),
  clusterId: z.string().uuid(),
  isPotentialDuplicate: z.boolean(),
  submittedAtIso: z.string().datetime(),
})

export type SubmitReportResponse = z.infer<typeof submitReportResponseSchema>

/**
 * Validasi pencarian cepat kode pelacakan dari Landing Page.
 * Format standar: SW-2026-XXXX (alfanumerik huruf besar).
 * Menggunakan .transform() agar input huruf kecil dari ponsel dinormalisasi otomatis.
 */
export const quickTrackingSchema = z.object({
  trackingCode: z
    .string()
    .trim()
    .min(1, 'Masukkan kode pelacakan laporan Anda')
    .transform((val) => val.toUpperCase())
    .pipe(
      z.string().regex(/^SW-\d{4}-[A-Z0-9]{4}$/, {
        message: 'Format kode tidak valid. Contoh: SW-2026-X89B',
      }),
    ),
})

export type QuickTrackingInput = z.infer<typeof quickTrackingSchema>

/**
 * Kontrak data statistik telemetri Landing Page (24 jam terakhir)
 */
export const landingStatsSchema = z.object({
  activeReports24h: z.number().int().nonnegative(),
  verifiedReports: z.number().int().nonnegative(),
  activeHotspots: z.number().int().nonnegative(),
  handledIncidents: z.number().int().nonnegative(),
  lastUpdatedIso: z.string().datetime(),
})

export type LandingStats = z.infer<typeof landingStatsSchema>
