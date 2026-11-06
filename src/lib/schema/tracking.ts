import { z } from 'zod'
import {
  handlingStatusEnum,
  incidentTypeEnum,
  priorityEnum,
  verificationStatusEnum,
} from './reports'

/**
 * Validasi parameter input kode pelacakan rute /lacak/$code.
 */
export const getReportTrackingInputSchema = z.object({
  trackingCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^SW-\d{4}-[A-Z0-9]{4}$/, {
      message: 'Format kode pelacakan tidak valid. Contoh: SW-2026-X89B',
    }),
})

export type GetReportTrackingInput = z.infer<typeof getReportTrackingInputSchema>

/**
 * Status penyelesaian untuk fase pada 4-Phase Stepper.
 */
export const stepperPhaseStatusEnum = z.enum([
  'completed',
  'in_progress',
  'pending',
  'rejected',
])

export type StepperPhaseStatus = z.infer<typeof stepperPhaseStatusEnum>

/**
 * Struktur data fase individual pada 4-Phase Stepper.
 */
export const trackingTimelinePhaseSchema = z.object({
  phaseIndex: z.number().int().min(1).max(4),
  phaseKey: z.enum(['received', 'analyzed', 'verified', 'handling']),
  title: z.string(),
  description: z.string(),
  status: stepperPhaseStatusEnum,
  timestampIso: z.string().datetime().nullable(),
  badgeLabel: z.string(),
  note: z.string().optional(),
})

export type TrackingTimelinePhase = z.infer<typeof trackingTimelinePhaseSchema>

/**
 * Entri catatan riwayat audit imutabel (Rule 8).
 */
export const trackingAuditEntrySchema = z.object({
  id: z.string().uuid(),
  statusType: z.enum(['verification', 'handling', 'priority']),
  previousValue: z.string().nullable(),
  newValue: z.string(),
  changedBy: z.string(), // Label yang disanitasi: 'Sistem' atau 'Petugas Verifikasi'
  reasonNote: z.string(),
  createdAtIso: z.string().datetime(),
})

export type TrackingAuditEntry = z.infer<typeof trackingAuditEntrySchema>

/**
 * Data bukti foto publik yang aman (Rule 7: bebas EXIF sensitif GPS).
 */
export const trackingEvidenceSchema = z.object({
  id: z.string().uuid(),
  mediaUrl: z.string().url(),
  mimeType: z.string(),
  fileSizeBytes: z.number(),
  fileHashSha256: z.string(),
  exifCaptureTimeIso: z.string().datetime().nullable(),
})

export type TrackingEvidence = z.infer<typeof trackingEvidenceSchema>

/**
 * Koordinat yang disamarkan (Rule 7: jittered to kelurahan level ~500m-1km).
 */
export const maskedLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  approximateRadiusMeters: z.number().default(800),
})

export type MaskedLocation = z.infer<typeof maskedLocationSchema>

/**
 * Kontrak respons detail pelacakan laporan lengkap.
 */
export const reportTrackingDetailSchema = z.object({
  id: z.string().uuid(),
  trackingCode: z.string(),
  incidentType: incidentTypeEnum,
  description: z.string(),
  observedAtIso: z.string().datetime(),
  submittedAtIso: z.string().datetime(),
  addressDisplay: z.string().nullable(),
  maskedLocation: maskedLocationSchema,
  verificationStatus: verificationStatusEnum,
  priority: priorityEnum,
  handlingStatus: handlingStatusEnum,
  clusterId: z.string().uuid().nullable(),
  isPotentialDuplicate: z.boolean(),
  satelliteHotspotMatched: z.boolean(),
  evidence: trackingEvidenceSchema.nullable(),
  phases: z.array(trackingTimelinePhaseSchema).length(4),
  auditHistory: z.array(trackingAuditEntrySchema),
})

export type ReportTrackingDetail = z.infer<typeof reportTrackingDetailSchema>
