import { z } from 'zod'
import {
  incidentTypeEnum,
  verificationStatusEnum,
  priorityEnum,
  handlingStatusEnum,
} from './reports'

/**
 * Legacy login schema (disediakan untuk kompatibilitas ke belakang).
 */
export const moderatorLoginInputSchema = z.object({
  passcode: z.string().min(1, 'Passcode verifikator wajib diisi'),
})

/**
 * Filter kueri untuk antrean triase moderator (/admin/triase).
 */
export const triageQueueQuerySchema = z.object({
  priority: z.enum(['all', 'high', 'normal', 'low']).default('all'),
  status: z
    .enum([
      'all',
      'pending',
      'needs_review',
      'verified',
      'insufficient_evidence',
      'rejected',
    ])
    .default('all'),
  incidentType: z
    .enum(['all', 'karhutla', 'permukiman', 'industri', 'lainnya'])
    .default('all'),
  search: z.string().optional().default(''),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
})

export type TriageQueueQuery = z.infer<typeof triageQueueQuerySchema>

/**
 * Item antrean laporan triase untuk tampilan daftar kartu.
 */
export const moderatorQueueItemSchema = z.object({
  id: z.string().uuid(),
  trackingCode: z.string(),
  incidentType: incidentTypeEnum,
  description: z.string(),
  observedAt: z.string().datetime(),
  submittedAt: z.string().datetime(),
  addressDisplay: z.string().nullable(),
  verificationStatus: verificationStatusEnum,
  priority: priorityEnum,
  handlingStatus: handlingStatusEnum,
  isPotentialDuplicate: z.boolean(),
  clusterId: z.string().uuid().nullable(),
  satelliteHotspotMatched: z.boolean(),
  evidenceThumbnailUrl: z.string().nullable(),
  evidenceCount: z.number().int().min(0),
})

export type ModeratorQueueItem = z.infer<typeof moderatorQueueItemSchema>

/**
 * Statistik ringkasan telemetri antrean triase.
 */
export const triageStatsSchema = z.object({
  pendingCount: z.number().int().min(0),
  needsReviewCount: z.number().int().min(0),
  highPriorityCount: z.number().int().min(0),
  todayReportsCount: z.number().int().min(0),
})

export type TriageStats = z.infer<typeof triageStatsSchema>

/**
 * Payload respons lengkap antrean triase.
 */
export const triageQueueResponseSchema = z.object({
  items: z.array(moderatorQueueItemSchema),
  stats: triageStatsSchema,
  totalMatching: z.number().int().min(0),
})

export type TriageQueueResponse = z.infer<typeof triageQueueResponseSchema>

/**
 * Bukti foto dan metadata EXIF untuk peninjauan verifikator.
 */
export const moderatorEvidenceSchema = z.object({
  id: z.string().uuid(),
  mediaUrl: z.string().url(),
  r2ObjectKey: z.string(),
  fileHashSha256: z.string(),
  exifCaptureTime: z.string().datetime().nullable(),
  fileSizeBytes: z.number().int().positive(),
  mimeType: z.string(),
  createdAt: z.string().datetime(),
  timeDiscrepancyMinutes: z.number().nullable(),
  isExifConsistent: z.boolean().nullable(),
})

export type ModeratorEvidence = z.infer<typeof moderatorEvidenceSchema>

/**
 * Laporan lain dalam klaster terdekat (radius 2 km).
 */
export const nearbyClusterReportSchema = z.object({
  id: z.string().uuid(),
  trackingCode: z.string(),
  incidentType: incidentTypeEnum,
  observedAt: z.string().datetime(),
  distanceMeters: z.number(),
  verificationStatus: verificationStatusEnum,
})

export type NearbyClusterReport = z.infer<typeof nearbyClusterReportSchema>

/**
 * Titik panas satelit NASA FIRMS terdekat (radius 5 km).
 */
export const nearbySatelliteHotspotSchema = z.object({
  id: z.string().uuid(),
  source: z.string(),
  distanceKm: z.number(),
  brightness: z.number().nullable(),
  confidence: z.string().nullable(),
  acquiredAt: z.string().datetime(),
})

export type NearbySatelliteHotspot = z.infer<typeof nearbySatelliteHotspotSchema>

/**
 * Riwayat perubahan status imutabel.
 */
export const reportAuditHistoryItemSchema = z.object({
  id: z.string().uuid(),
  statusType: z.string(),
  previousValue: z.string().nullable(),
  newValue: z.string(),
  changedBy: z.string(),
  reasonNote: z.string(),
  createdAt: z.string().datetime(),
})

export type ReportAuditHistoryItem = z.infer<typeof reportAuditHistoryItemSchema>

/**
 * Payload detail lengkap laporan untuk halaman /admin/laporan/$id.
 */
export const moderatorReportDetailSchema = z.object({
  id: z.string().uuid(),
  trackingCode: z.string(),
  incidentType: incidentTypeEnum,
  description: z.string(),
  observedAt: z.string().datetime(),
  submittedAt: z.string().datetime(),

  // Koordinat presisi asli (khusus moderator/aparatur berwenang, Rule 7)
  latitude: z.number(),
  longitude: z.number(),
  addressDisplay: z.string().nullable(),

  verificationStatus: verificationStatusEnum,
  priority: priorityEnum,
  handlingStatus: handlingStatusEnum,

  isPotentialDuplicate: z.boolean(),
  clusterId: z.string().uuid().nullable(),
  satelliteHotspotMatched: z.boolean(),

  // Data pelapor
  isAnonymous: z.boolean(),
  reporterName: z.string().nullable(),
  reporterPhone: z.string().nullable(),
  reporterEmail: z.string().nullable(),

  evidence: z.array(moderatorEvidenceSchema),
  nearbyClusterReports: z.array(nearbyClusterReportSchema),
  nearbySatelliteHotspots: z.array(nearbySatelliteHotspotSchema),
  statusHistory: z.array(reportAuditHistoryItemSchema),
})

export type ModeratorReportDetail = z.infer<typeof moderatorReportDetailSchema>

/**
 * Input mutasi perubahan status laporan oleh verifikator.
 */
export const updateReportStatusInputSchema = z.object({
  reportId: z.string().uuid('ID laporan tidak valid'),
  statusType: z.enum(['verification', 'handling', 'priority'], {
    message:
      'Tipe status harus salah satu dari: verification, handling, atau priority',
  }),
  newValue: z.string().min(1, 'Nilai status baru wajib dipilih'),
  reasonNote: z
    .string()
    .trim()
    .min(
      10,
      'Catatan alasan verifikasi minimal 10 karakter wajib diisi untuk integritas audit',
    ),
})

export type ModeratorLoginInput = z.infer<typeof moderatorLoginInputSchema>
export type UpdateReportStatusInput = z.infer<
  typeof updateReportStatusInputSchema
>
