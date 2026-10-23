import { describe, expect, it } from 'bun:test'
import { quickTrackingSchema, landingStatsSchema } from '@/lib/schema'
import type { LandingStats } from '@/lib/schema'
import { fetchLandingStats, getLandingStats } from '@/server/functions/reports'

describe('Landing Page Schemas & Telemetry', () => {
  describe('quickTrackingSchema', () => {
    it('harus menerima format kode pelacakan valid huruf besar', () => {
      const result = quickTrackingSchema.safeParse({
        trackingCode: 'SW-2026-X89B',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.trackingCode).toBe('SW-2026-X89B')
      }
    })

    it('harus menormalisasi kode huruf kecil dari ponsel menjadi huruf besar', () => {
      const result = quickTrackingSchema.safeParse({
        trackingCode: 'sw-2026-a101',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.trackingCode).toBe('SW-2026-A101')
      }
    })

    it('harus membersihkan spasi di awal dan akhir kode (trim)', () => {
      const result = quickTrackingSchema.safeParse({
        trackingCode: '  SW-2026-B202   ',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.trackingCode).toBe('SW-2026-B202')
      }
    })

    it('harus menolak format kode tanpa pemisah tanda hubung', () => {
      const result = quickTrackingSchema.safeParse({
        trackingCode: 'SW2026A101',
      })
      expect(result.success).toBe(false)
    })

    it('harus menolak format kode yang polanya tidak sesuai', () => {
      const result = quickTrackingSchema.safeParse({
        trackingCode: 'SW-ABC-1234',
      })
      expect(result.success).toBe(false)
    })

    it('harus menolak input string kosong dengan pesan kesalahan informatif', () => {
      const result = quickTrackingSchema.safeParse({
        trackingCode: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('landingStatsSchema', () => {
    it('harus memvalidasi objek statistik telemetri yang valid', () => {
      const sampleStats: LandingStats = {
        activeReports24h: 15,
        verifiedReports: 9,
        activeHotspots: 24,
        handledIncidents: 7,
        lastUpdatedIso: new Date().toISOString(),
      }

      const result = landingStatsSchema.safeParse(sampleStats)
      expect(result.success).toBe(true)
    })

    it('harus menolak angka negatif pada statistik', () => {
      const invalidStats = {
        activeReports24h: -1,
        verifiedReports: 9,
        activeHotspots: 24,
        handledIncidents: 7,
        lastUpdatedIso: new Date().toISOString(),
      }

      const result = landingStatsSchema.safeParse(invalidStats)
      expect(result.success).toBe(false)
    })

    it('harus menolak string waktu yang bukan format ISO datetime', () => {
      const invalidStats = {
        activeReports24h: 15,
        verifiedReports: 9,
        activeHotspots: 24,
        handledIncidents: 7,
        lastUpdatedIso: '23-10-2026 14:00',
      }

      const result = landingStatsSchema.safeParse(invalidStats)
      expect(result.success).toBe(false)
    })
  })

  describe('fetchLandingStats Business Logic', () => {
    it('harus mengembalikan data telemetri yang sesuai dengan landingStatsSchema', async () => {
      const data = await fetchLandingStats()
      const validation = landingStatsSchema.safeParse(data)
      expect(validation.success).toBe(true)
      expect(typeof data.activeReports24h).toBe('number')
      expect(typeof data.verifiedReports).toBe('number')
      expect(typeof data.activeHotspots).toBe('number')
      expect(typeof data.handledIncidents).toBe('number')
      expect(typeof data.lastUpdatedIso).toBe('string')
    })

    it('harus menyediakan server function getLandingStats yang terdefinisi', () => {
      expect(typeof getLandingStats).toBe('function')
    })
  })
})
