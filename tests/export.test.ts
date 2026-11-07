import { describe, expect, it } from 'bun:test'
import type { ExportReportRow } from '@/lib/schema/export'
import {
  exportReportsQuerySchema,
  exportDataResponseSchema,
} from '@/lib/schema/export'
import {
  escapeCsvValue,
  generateReportsCsv,
  generateReportsGeoJson,
  calculateExportTimeBoundary,
} from '@/server/services/export'

describe('Incident Data Export Damkar & BPBD (Plan 11)', () => {
  describe('Zod Isomorphic Schemas', () => {
    it('harus mengisi nilai default yang tepat pada exportReportsQuerySchema', () => {
      const parsed = exportReportsQuerySchema.parse({})
      expect(parsed.format).toBe('csv')
      expect(parsed.verificationStatus).toBe('verified')
      expect(parsed.incidentType).toBe('all')
      expect(parsed.timeRange).toBe('7d')
      expect(parsed.limit).toBe(500)
    })

    it('harus menerima parameter kueri ekspor kustom yang valid', () => {
      const parsed = exportReportsQuerySchema.parse({
        format: 'geojson',
        verificationStatus: 'all',
        incidentType: 'karhutla',
        timeRange: '24h',
        limit: 100,
      })
      expect(parsed.format).toBe('geojson')
      expect(parsed.verificationStatus).toBe('all')
      expect(parsed.incidentType).toBe('karhutla')
      expect(parsed.timeRange).toBe('24h')
      expect(parsed.limit).toBe(100)
    })

    it('harus menolak format berkas di luar enum', () => {
      expect(() => {
        exportReportsQuerySchema.parse({
          format: 'shapefile',
        })
      }).toThrow()
    })

    it('harus menolak limit di luar batas yang ditentukan', () => {
      expect(() => {
        exportReportsQuerySchema.parse({
          limit: 0,
        })
      }).toThrow()

      expect(() => {
        exportReportsQuerySchema.parse({
          limit: 5000,
        })
      }).toThrow()
    })

    it('harus memvalidasi exportDataResponseSchema secara utuh', () => {
      const payload = {
        filename: 'siagawarga-insiden-2026-11-06.csv',
        mimeType: 'text/csv; charset=utf-8',
        content: 'kode_lacak,jenis_insiden\nSW-2026-A101,karhutla',
        totalRows: 1,
      }
      const parsed = exportDataResponseSchema.parse(payload)
      expect(parsed.filename).toBe('siagawarga-insiden-2026-11-06.csv')
      expect(parsed.totalRows).toBe(1)
    })
  })

  describe('CSV Sanitization & Formatting (RFC 4180)', () => {
    it('harus menangani nilai null, undefined, dan angka pada escapeCsvValue', () => {
      expect(escapeCsvValue(null)).toBe('')
      expect(escapeCsvValue(undefined)).toBe('')
      expect(escapeCsvValue(101.45)).toBe('101.45')
      expect(escapeCsvValue('Siaga')).toBe('Siaga')
    })

    it('harus membungkus teks yang memuat koma atau baris baru dengan tanda petik ganda', () => {
      expect(escapeCsvValue('Lahan, gambut terbakar')).toBe(
        '"Lahan, gambut terbakar"',
      )
      expect(escapeCsvValue('Baris 1\nBaris 2')).toBe('"Baris 1\nBaris 2"')
    })

    it('harus melakukan escaping ganda pada tanda petik ganda di dalam teks', () => {
      expect(escapeCsvValue('Kebakaran "besar" di ruko')).toBe(
        '"Kebakaran ""besar"" di ruko"',
      )
    })

    it('harus menetralisasi CSV formula injection (CWE-1236) pada teks berbahaya', () => {
      expect(escapeCsvValue("=cmd|'/C calc'!A0")).toBe("'=cmd|'/C calc'!A0")
      expect(escapeCsvValue('@SUM(1+1)*cmd')).toBe("'@SUM(1+1)*cmd")
      expect(escapeCsvValue('+123-malicious')).toBe("'+123-malicious")
      expect(escapeCsvValue('-malicious-formula')).toBe("'-malicious-formula")
      // Koordinat negatif sah berupa angka tetap tidak terpengaruh
      expect(escapeCsvValue(-6.2088)).toBe('-6.2088')
      expect(escapeCsvValue('-0.5021')).toBe('-0.5021')
    })

    it('harus menghasilkan berkas CSV terstruktur dengan header dan baris data yang tepat', () => {
      const sampleRows: Array<ExportReportRow> = [
        {
          trackingCode: 'SW-2026-A101',
          incidentType: 'karhutla',
          description: 'Lahan gambut, api merambat cepat',
          observedAt: new Date('2026-11-06T08:00:00.000Z'),
          submittedAt: new Date('2026-11-06T08:15:00.000Z'),
          latitude: 0.5333,
          longitude: 101.45,
          addressDisplay: 'Kec. Rumbai, Pekanbaru',
          verificationStatus: 'verified',
          priority: 'high',
          handlingStatus: 'in_progress',
          satelliteHotspotMatched: true,
          isPotentialDuplicate: false,
          reporterName: 'Budi Santoso',
          reporterPhone: '081234567890',
          isAnonymous: false,
          evidenceMediaUrl: 'https://r2.siagawarga.id/foto1.webp',
        },
        {
          trackingCode: 'SW-2026-B202',
          incidentType: 'permukiman',
          description: 'Rumah warga padat penduduk',
          observedAt: new Date('2026-11-06T09:00:00.000Z'),
          submittedAt: new Date('2026-11-06T09:10:00.000Z'),
          latitude: -6.1751,
          longitude: 106.8272,
          addressDisplay: 'Kec. Gambir, Jakarta Pusat',
          verificationStatus: 'verified',
          priority: 'high',
          handlingStatus: 'forwarded',
          satelliteHotspotMatched: false,
          isPotentialDuplicate: false,
          reporterName: 'Saksi Rahasia',
          reporterPhone: '085712345678',
          isAnonymous: true,
          evidenceMediaUrl: null,
        },
      ]

      const csvContent = generateReportsCsv(sampleRows)
      const lines = csvContent.split('\r\n')

      // Verifikasi baris header
      expect(lines[0]).toBe(
        'kode_lacak,jenis_insiden,deskripsi,waktu_pengamatan,waktu_lapor,latitude,longitude,alamat,status_verifikasi,prioritas,status_penanganan,korelasi_satelit,klaster_duplikat,nama_pelapor,telepon_pelapor,tautan_bukti_foto',
      )

      // Verifikasi baris 1 (non-anonim)
      expect(lines[1]).toContain('SW-2026-A101')
      expect(lines[1]).toContain('karhutla')
      expect(lines[1]).toContain('"Lahan gambut, api merambat cepat"')
      expect(lines[1]).toContain('Budi Santoso')
      expect(lines[1]).toContain('081234567890')

      // Verifikasi baris 2 (anonim: nama disamarkan & telepon dikosongkan)
      expect(lines[2]).toContain('SW-2026-B202')
      expect(lines[2]).toContain('permukiman')
      expect(lines[2]).toContain('Warga Anonim')
      expect(lines[2]).not.toContain('085712345678')
    })
  })

  describe('GeoJSON Spatial Construction (RFC 7946)', () => {
    it('harus membentuk struktur FeatureCollection dengan geometri Point [lon, lat]', () => {
      const sampleRows: Array<ExportReportRow> = [
        {
          trackingCode: 'SW-2026-A101',
          incidentType: 'karhutla',
          description: 'Lahan gambut merambat',
          observedAt: new Date('2026-11-06T08:00:00.000Z'),
          submittedAt: new Date('2026-11-06T08:15:00.000Z'),
          latitude: 0.5333,
          longitude: 101.45,
          addressDisplay: 'Kec. Rumbai, Pekanbaru',
          verificationStatus: 'verified',
          priority: 'high',
          handlingStatus: 'in_progress',
          satelliteHotspotMatched: true,
          isPotentialDuplicate: false,
          reporterName: 'Budi Santoso',
          reporterPhone: '081234567890',
          isAnonymous: false,
          evidenceMediaUrl: 'https://r2.siagawarga.id/foto1.webp',
        },
      ]

      const geoJsonString = generateReportsGeoJson(sampleRows)
      const parsed = JSON.parse(geoJsonString)

      expect(parsed.type).toBe('FeatureCollection')
      expect(Array.isArray(parsed.features)).toBe(true)
      expect(parsed.features.length).toBe(1)

      const feature = parsed.features[0]
      expect(feature.type).toBe('Feature')
      expect(feature.geometry.type).toBe('Point')
      // Sesuai standar GeoJSON: [longitude, latitude]
      expect(feature.geometry.coordinates).toEqual([101.45, 0.5333])
      expect(feature.properties.trackingCode).toBe('SW-2026-A101')
      expect(feature.properties.incidentType).toBe('karhutla')
      expect(feature.properties.verificationStatus).toBe('verified')
      expect(feature.properties.priority).toBe('high')
      expect(feature.properties.satelliteHotspotMatched).toBe(true)
      expect(feature.properties.reporterName).toBe('Budi Santoso')
    })

    it('harus menyamarkan identitas pelapor anonim pada properti GeoJSON', () => {
      const sampleRows: Array<ExportReportRow> = [
        {
          trackingCode: 'SW-2026-B202',
          incidentType: 'permukiman',
          description: 'Asap hitam tebal',
          observedAt: new Date('2026-11-06T09:00:00.000Z'),
          submittedAt: new Date('2026-11-06T09:10:00.000Z'),
          latitude: -6.1751,
          longitude: 106.8272,
          addressDisplay: 'Jakarta Pusat',
          verificationStatus: 'verified',
          priority: 'high',
          handlingStatus: 'forwarded',
          satelliteHotspotMatched: false,
          isPotentialDuplicate: false,
          reporterName: 'Saksi Rahasia',
          reporterPhone: '085712345678',
          isAnonymous: true,
          evidenceMediaUrl: null,
        },
      ]

      const geoJsonString = generateReportsGeoJson(sampleRows)
      const parsed = JSON.parse(geoJsonString)
      const properties = parsed.features[0].properties

      expect(properties.reporterName).toBe('Warga Anonim')
      expect(properties.reporterPhone).toBeNull()
    })
  })

  describe('Time Range Boundary Logic', () => {
    it('harus menghitung batas waktu yang benar untuk 24h, 7d, 30d, dan all', () => {
      const now = new Date('2026-11-06T12:00:00.000Z')

      const date24h = calculateExportTimeBoundary('24h', now)
      expect(date24h).not.toBeNull()
      expect(now.getTime() - date24h!.getTime()).toBe(24 * 60 * 60 * 1000)

      const date7d = calculateExportTimeBoundary('7d', now)
      expect(date7d).not.toBeNull()
      expect(now.getTime() - date7d!.getTime()).toBe(7 * 24 * 60 * 60 * 1000)

      const date30d = calculateExportTimeBoundary('30d', now)
      expect(date30d).not.toBeNull()
      expect(now.getTime() - date30d!.getTime()).toBe(30 * 24 * 60 * 60 * 1000)

      const dateAll = calculateExportTimeBoundary('all', now)
      expect(dateAll).toBeNull()
    })
  })
})
