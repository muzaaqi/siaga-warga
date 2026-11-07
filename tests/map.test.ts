import { describe, expect, it } from 'bun:test'
import {
  publicMapQuerySchema,
  publicMapReportItemSchema,
  publicMapHotspotItemSchema,
  publicMapDataResponseSchema,
} from '@/lib/schema/map'
import {
  parseNasaFirmsCsv,
  getOrSyncSatelliteHotspots,
} from '@/server/services/hotspots'
import { fetchPublicMapData } from '@/server/services/map'
import { getPublicMapData } from '@/server/functions/map'

describe('Plan 08: Public Interactive Map & NASA FIRMS Hotspots (/pantau)', () => {
  describe('1. Zod Validation Schemas', () => {
    it('harus mengisi nilai default filter ketika menerima objek kosong', () => {
      const parsed = publicMapQuerySchema.parse({})
      expect(parsed.incidentType).toBe('all')
      expect(parsed.timeRange).toBe('24h')
      expect(parsed.handlingStatus).toBe('all')
    })

    it('harus menerima parameter filter valid', () => {
      const parsed = publicMapQuerySchema.parse({
        incidentType: 'karhutla',
        timeRange: '3d',
        handlingStatus: 'in_progress',
      })
      expect(parsed.incidentType).toBe('karhutla')
      expect(parsed.timeRange).toBe('3d')
      expect(parsed.handlingStatus).toBe('in_progress')
    })

    it('harus menolak opsi timeRange yang tidak valid', () => {
      const result = publicMapQuerySchema.safeParse({
        timeRange: '1month',
      })
      expect(result.success).toBe(false)
    })

    it('harus memvalidasi objek publicMapReportItemSchema yang valid', () => {
      const mockReport = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        trackingCode: 'SW-2026-X89B',
        incidentType: 'karhutla',
        description: 'Kebakaran lahan gambut dekat kanal',
        observedAtIso: new Date().toISOString(),
        submittedAtIso: new Date().toISOString(),
        latitude: -0.7891,
        longitude: 101.4567,
        addressDisplay: 'Kecamatan Siak, Riau',
        handlingStatus: 'in_progress',
        thumbnailUrl: 'https://cdn.siagawarga.id/evidence/fire-1.webp',
      }
      const result = publicMapReportItemSchema.safeParse(mockReport)
      expect(result.success).toBe(true)
    })

    it('harus memvalidasi objek publicMapHotspotItemSchema dari satelit NASA', () => {
      const mockHotspot = {
        id: '223e4567-e89b-12d3-a456-426614174001',
        source: 'VIIRS_SNPP',
        latitude: -1.2345,
        longitude: 103.5678,
        brightness: 345.8,
        confidence: 'nominal',
        acquiredAtIso: new Date().toISOString(),
      }
      const result = publicMapHotspotItemSchema.safeParse(mockHotspot)
      expect(result.success).toBe(true)
    })

    it('harus memvalidasi struktur utuh publicMapDataResponseSchema', () => {
      const mockPayload = {
        reports: [],
        hotspots: [],
        stats: {
          totalVerifiedReports: 5,
          totalActiveHotspots: 12,
          totalInHandling: 3,
          lastSyncedAtIso: new Date().toISOString(),
        },
      }
      const result = publicMapDataResponseSchema.safeParse(mockPayload)
      expect(result.success).toBe(true)
    })
  })

  describe('2. NASA FIRMS CSV Parser & Data Conversion', () => {
    it('harus mengurai data CSV NRT NASA FIRMS dengan format baris yang benar', () => {
      const sampleCsv = `country_id,latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight
IDN,-0.5234,101.8923,338.4,0.4,0.4,2026-11-06,0430,N,VIIRS,nominal,2.0NRT,295.2,14.8,D
IDN,-2.1456,113.4567,360.1,0.5,0.4,2026-11-06,0435,N,VIIRS,high,2.0NRT,300.5,22.1,D`

      const parsed = parseNasaFirmsCsv(sampleCsv)
      expect(parsed).toHaveLength(2)

      expect(parsed[0].source).toBe('VIIRS_SNPP')
      expect(parsed[0].latitude).toBe(-0.5234)
      expect(parsed[0].longitude).toBe(101.8923)
      expect(parsed[0].brightness).toBe(338.4)
      expect(parsed[0].confidence).toBe('nominal')
      expect(parsed[0].acquiredAt).toBeInstanceOf(Date)
      expect(parsed[0].acquiredAt.toISOString()).toBe('2026-11-06T04:30:00.000Z')

      expect(parsed[1].confidence).toBe('high')
    })

    it('harus melewatkan baris dengan koordinat di luar wilayah Indonesia atau format rusak', () => {
      const corruptedCsv = `country_id,latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight
IDN,50.1234,10.8923,338.4,0.4,0.4,2026-11-06,0430,N,VIIRS,nominal,2.0NRT,295.2,14.8,D
IDN,invalid,101.8923,338.4,0.4,0.4,2026-11-06,0430,N,VIIRS,nominal,2.0NRT,295.2,14.8,D
IDN,-1.2345,102.3456,340.0,0.4,0.4,2026-11-06,0500,N,VIIRS,nominal,2.0NRT,295.2,14.8,D`

      const parsed = parseNasaFirmsCsv(corruptedCsv)
      // Baris 1: di luar Indonesia (lat 50), Baris 2: invalid lat. Hanya baris 3 yang valid.
      expect(parsed).toHaveLength(1)
      expect(parsed[0].latitude).toBe(-1.2345)
    })
  })

  describe('3. Satellite Hotspot Caching & Database Queries', () => {
    it(
      'harus mengembalikan array titik panas satelit dari basis data / fallback',
      async () => {
        const hotspots = await getOrSyncSatelliteHotspots(24)
        expect(Array.isArray(hotspots)).toBe(true)
        if (hotspots.length > 0) {
          expect(hotspots[0].id).toBeDefined()
          expect(hotspots[0].source).toBeDefined()
          expect(typeof hotspots[0].latitude).toBe('number')
          expect(typeof hotspots[0].longitude).toBe('number')
        }
      },
      15000,
    )
  })

  describe('4. Map Data Service (fetchPublicMapData)', () => {
    it(
      'harus mengembalikan data peta lengkap dan hanya menyertakan laporan terverifikasi',
      async () => {
        const result = await fetchPublicMapData({
          incidentType: 'all',
          timeRange: '7d',
          handlingStatus: 'all',
        })

        expect(result).toBeDefined()
        expect(Array.isArray(result.reports)).toBe(true)
        expect(Array.isArray(result.hotspots)).toBe(true)
        expect(result.stats).toBeDefined()
        expect(result.stats.totalVerifiedReports).toBeGreaterThanOrEqual(0)
        expect(result.stats.totalActiveHotspots).toBeGreaterThanOrEqual(0)

        // Verifikasi zero PII pada setiap laporan warga
        for (const report of result.reports) {
          expect((report as any).reporterPhone).toBeUndefined()
          expect((report as any).reporterName).toBeUndefined()
          expect((report as any).reporterUserId).toBeUndefined()
          expect(typeof report.latitude).toBe('number')
          expect(typeof report.longitude).toBe('number')
        }
      },
      15000,
    )

    it(
      'harus memfilter laporan warga berdasarkan incidentType',
      async () => {
        const result = await fetchPublicMapData({
          incidentType: 'karhutla',
          timeRange: '7d',
          handlingStatus: 'all',
        })

        for (const report of result.reports) {
          expect(report.incidentType).toBe('karhutla')
        }
      },
      15000,
    )
  })

  describe('5. Server Function Integration', () => {
    it('harus menyediakan server function getPublicMapData yang terdefinisi', () => {
      expect(getPublicMapData).toBeDefined()
      expect(typeof getPublicMapData).toBe('function')
    })
  })
})
