import { z } from 'zod'
import {
  handlingStatusEnum,
  incidentTypeEnum,
} from './reports'

/**
 * Parameter filter kueri untuk peta publik /pantau.
 */
export const publicMapQuerySchema = z.object({
  incidentType: z
    .enum(['all', 'karhutla', 'permukiman', 'industri', 'lainnya'])
    .default('all'),
  timeRange: z.enum(['24h', '3d', '7d']).default('24h'),
  handlingStatus: z
    .enum([
      'all',
      'not_forwarded',
      'forwarded',
      'acknowledged',
      'in_progress',
      'resolved',
    ])
    .default('all'),
})

export type PublicMapQuery = z.infer<typeof publicMapQuerySchema>

/**
 * Item insiden laporan warga untuk tampilan peta publik.
 * Rule 7: Zero PII Leakage & Koordinat Tersamar (~800m).
 */
export const publicMapReportItemSchema = z.object({
  id: z.string().uuid(),
  trackingCode: z.string(),
  incidentType: incidentTypeEnum,
  description: z.string(),
  observedAtIso: z.string().datetime(),
  submittedAtIso: z.string().datetime(),
  latitude: z.number(), // Jittered latitude
  longitude: z.number(), // Jittered longitude
  addressDisplay: z.string().nullable(),
  handlingStatus: handlingStatusEnum,
  thumbnailUrl: z.string().url().nullable(),
})

export type PublicMapReportItem = z.infer<typeof publicMapReportItemSchema>

/**
 * Item titik panas satelit NASA FIRMS dari sensor VIIRS/MODIS.
 */
export const publicMapHotspotItemSchema = z.object({
  id: z.string().uuid(),
  source: z.string(), // e.g. 'VIIRS_SNPP', 'MODIS'
  latitude: z.number(),
  longitude: z.number(),
  brightness: z.number().nullable(), // Kelvin
  confidence: z.string().nullable(), // 'nominal', 'high', 'low'
  acquiredAtIso: z.string().datetime(),
})

export type PublicMapHotspotItem = z.infer<typeof publicMapHotspotItemSchema>

/**
 * Ringkasan statistik telemetri sebaran insiden pada peta.
 */
export const mapTelemetryStatsSchema = z.object({
  totalVerifiedReports: z.number().int().min(0),
  totalActiveHotspots: z.number().int().min(0),
  totalInHandling: z.number().int().min(0),
  lastSyncedAtIso: z.string().datetime(),
})

export type MapTelemetryStats = z.infer<typeof mapTelemetryStatsSchema>

/**
 * Kontrak respons gabungan untuk rute /pantau.
 */
export const publicMapDataResponseSchema = z.object({
  reports: z.array(publicMapReportItemSchema),
  hotspots: z.array(publicMapHotspotItemSchema),
  stats: mapTelemetryStatsSchema,
})

export type PublicMapDataResponse = z.infer<typeof publicMapDataResponseSchema>
