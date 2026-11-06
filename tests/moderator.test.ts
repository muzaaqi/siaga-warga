import { describe, expect, it } from 'bun:test'
import {
  triageQueueQuerySchema,
  updateReportStatusInputSchema,
  moderatorQueueItemSchema,
  triageStatsSchema,
  moderatorReportDetailSchema,
} from '@/lib/schema/moderator'
import {
  calculateExifDiscrepancy,
  validateStatusValueForType,
  fetchTriageStats,
  fetchTriageQueue,
} from '@/server/services/moderator'

describe('Moderator Command Center & Triage (Plan 09)', () => {
  describe('Zod Isomorphic Schemas', () => {
    it('harus mengisi nilai default yang tepat pada triageQueueQuerySchema', () => {
      const parsed = triageQueueQuerySchema.parse({})
      expect(parsed.priority).toBe('all')
      expect(parsed.status).toBe('all')
      expect(parsed.incidentType).toBe('all')
      expect(parsed.search).toBe('')
      expect(parsed.limit).toBe(50)
      expect(parsed.offset).toBe(0)
    })

    it('harus menerima parameter kueri triase yang valid', () => {
      const parsed = triageQueueQuerySchema.parse({
        priority: 'high',
        status: 'pending',
        incidentType: 'karhutla',
        search: 'SW-2026',
        limit: 20,
        offset: 10,
      })
      expect(parsed.priority).toBe('high')
      expect(parsed.status).toBe('pending')
      expect(parsed.incidentType).toBe('karhutla')
      expect(parsed.search).toBe('SW-2026')
      expect(parsed.limit).toBe(20)
      expect(parsed.offset).toBe(10)
    })

    it('harus memvalidasi item antrean moderatorQueueItemSchema', () => {
      const item = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        trackingCode: 'SW-2026-X89B',
        incidentType: 'karhutla',
        description: 'Kebakaran lahan gambut terdeteksi asap tebal',
        observedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        addressDisplay: 'Kecamatan Siak, Riau',
        verificationStatus: 'pending',
        priority: 'high',
        handlingStatus: 'not_forwarded',
        isPotentialDuplicate: false,
        clusterId: null,
        satelliteHotspotMatched: true,
        evidenceThumbnailUrl: 'https://r2.siagawarga.id/evidence/test.webp',
        evidenceCount: 1,
      }

      const parsed = moderatorQueueItemSchema.parse(item)
      expect(parsed.trackingCode).toBe('SW-2026-X89B')
      expect(parsed.priority).toBe('high')
      expect(parsed.satelliteHotspotMatched).toBe(true)
    })

    it('harus memvalidasi telemetri triageStatsSchema', () => {
      const stats = {
        pendingCount: 5,
        needsReviewCount: 2,
        highPriorityCount: 3,
        todayReportsCount: 12,
      }
      const parsed = triageStatsSchema.parse(stats)
      expect(parsed.pendingCount).toBe(5)
      expect(parsed.highPriorityCount).toBe(3)
    })

    it('harus memvalidasi moderatorReportDetailSchema secara lengkap', () => {
      const detail = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        trackingCode: 'SW-2026-X89B',
        incidentType: 'karhutla',
        description: 'Kebakaran lahan gambut di pinggir jalan raya utama',
        observedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        latitude: -0.5021,
        longitude: 101.4478,
        addressDisplay: 'Kecamatan Siak, Riau',
        verificationStatus: 'pending',
        priority: 'high',
        handlingStatus: 'not_forwarded',
        isPotentialDuplicate: false,
        clusterId: null,
        satelliteHotspotMatched: true,
        isAnonymous: false,
        reporterName: 'Warga Siaga',
        reporterPhone: '081234567890',
        reporterEmail: 'warga@gmail.com',
        evidence: [],
        nearbyClusterReports: [],
        nearbySatelliteHotspots: [],
        statusHistory: [],
      }

      const parsed = moderatorReportDetailSchema.parse(detail)
      expect(parsed.trackingCode).toBe('SW-2026-X89B')
      expect(parsed.latitude).toBe(-0.5021)
    })

    it('harus menolak updateReportStatusInputSchema jika alasan kurang dari 10 karakter', () => {
      const invalidInput = {
        reportId: '123e4567-e89b-12d3-a456-426614174000',
        statusType: 'verification',
        newValue: 'verified',
        reasonNote: 'pendek', // < 10 karakter
      }

      const result = updateReportStatusInputSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('harus menerima updateReportStatusInputSchema dengan alasan valid', () => {
      const validInput = {
        reportId: '123e4567-e89b-12d3-a456-426614174000',
        statusType: 'verification',
        newValue: 'verified',
        reasonNote:
          'Foto bukti konsisten dengan anomali titik panas satelit NASA VIIRS',
      }

      const result = updateReportStatusInputSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })
  })

  describe('Logika Komparasi EXIF Kamera vs Waktu Pengamatan', () => {
    it('harus mengembalikan null jika metadata EXIF tidak tersedia', () => {
      const observedAt = new Date('2026-11-06T10:00:00Z')
      const result = calculateExifDiscrepancy(observedAt, null)
      expect(result.timeDiscrepancyMinutes).toBeNull()
      expect(result.isExifConsistent).toBeNull()
    })

    it('harus menandai konsisten (true) jika selisih waktu <= 120 menit', () => {
      const observedAt = new Date('2026-11-06T10:00:00Z')
      const exifTime = new Date('2026-11-06T10:15:00Z') // selisih 15 menit
      const result = calculateExifDiscrepancy(observedAt, exifTime)

      expect(result.timeDiscrepancyMinutes).toBe(15)
      expect(result.isExifConsistent).toBe(true)
    })

    it('harus menandai anomali (false) jika selisih waktu > 120 menit', () => {
      const observedAt = new Date('2026-11-06T10:00:00Z')
      const exifTime = new Date('2026-11-06T13:30:00Z') // selisih 210 menit (3.5 jam)
      const result = calculateExifDiscrepancy(observedAt, exifTime)

      expect(result.timeDiscrepancyMinutes).toBe(210)
      expect(result.isExifConsistent).toBe(false)
    })
  })

  describe('Validasi Konsistensi Nilai Status Terhadap Tipe', () => {
    it('harus menerima nilai enum yang sah untuk verification', () => {
      expect(validateStatusValueForType('verification', 'verified')).toBe(true)
      expect(validateStatusValueForType('verification', 'needs_review')).toBe(
        true,
      )
      expect(
        validateStatusValueForType('verification', 'insufficient_evidence'),
      ).toBe(true)
      expect(validateStatusValueForType('verification', 'rejected')).toBe(true)
      expect(validateStatusValueForType('verification', 'invalid_val')).toBe(
        false,
      )
    })

    it('harus menerima nilai enum yang sah untuk handling', () => {
      expect(validateStatusValueForType('handling', 'forwarded')).toBe(true)
      expect(validateStatusValueForType('handling', 'in_progress')).toBe(true)
      expect(validateStatusValueForType('handling', 'resolved')).toBe(true)
      expect(validateStatusValueForType('handling', 'verified')).toBe(false) // salah dimensi
    })

    it('harus menerima nilai enum yang sah untuk priority', () => {
      expect(validateStatusValueForType('priority', 'high')).toBe(true)
      expect(validateStatusValueForType('priority', 'normal')).toBe(true)
      expect(validateStatusValueForType('priority', 'low')).toBe(true)
      expect(validateStatusValueForType('priority', 'critical')).toBe(false)
    })
  })

  describe('Integrasi Basis Data & Server Functions', () => {
    it('harus dapat mengambil statistik antrean triase dari database', async () => {
      const stats = await fetchTriageStats()
      expect(typeof stats.pendingCount).toBe('number')
      expect(typeof stats.needsReviewCount).toBe('number')
      expect(typeof stats.highPriorityCount).toBe('number')
      expect(typeof stats.todayReportsCount).toBe('number')
      expect(stats.pendingCount).toBeGreaterThanOrEqual(0)
    })

    it('harus dapat mengambil antrean triase dengan query default', async () => {
      const result = await fetchTriageQueue({
        priority: 'all',
        status: 'all',
        incidentType: 'all',
        search: '',
        limit: 10,
        offset: 0,
      })

      expect(Array.isArray(result.items)).toBe(true)
      expect(result.stats).toBeDefined()
      expect(typeof result.totalMatching).toBe('number')
    })
  })
})
