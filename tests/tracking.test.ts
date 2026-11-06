import { describe, expect, it } from 'bun:test'
import {
  getReportTrackingInputSchema,
  reportTrackingDetailSchema,
} from '@/lib/schema/tracking'
import {
  calculateMaskedCoordinates,
  buildTrackingPhases,
  fetchReportByTrackingCode,
} from '@/server/services/tracking'
import { getReportByTrackingCode } from '@/server/functions/tracking'
import { db } from '@/server/db'
import { reports, reportEvidence, reportStatusHistory } from '@/server/db/schema'
import { eq } from 'drizzle-orm'

describe('Plan 07: Public Tracking Timeline (/lacak/$code)', () => {
  describe('1. Zod Validation Schemas', () => {
    it('harus menerima format kode pelacakan valid huruf besar alfanumerik', () => {
      const result = getReportTrackingInputSchema.safeParse({
        trackingCode: 'SW-2026-X89B',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.trackingCode).toBe('SW-2026-X89B')
      }
    })

    it('harus menormalisasi kode pelacakan dengan spasi dan huruf kecil', () => {
      const result = getReportTrackingInputSchema.safeParse({
        trackingCode: '  sw-2026-a1c2  ',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.trackingCode).toBe('SW-2026-A1C2')
      }
    })

    it('harus menolak format kode pelacakan tanpa pemisah tanda hubung', () => {
      const result = getReportTrackingInputSchema.safeParse({
        trackingCode: 'SW2026X89B',
      })
      expect(result.success).toBe(false)
    })

    it('harus menolak karakter simbol berbahaya atau format tidak sesuai', () => {
      const result = getReportTrackingInputSchema.safeParse({
        trackingCode: "SW-2026-'; DROP TABLE reports;--",
      })
      expect(result.success).toBe(false)
    })

    it('harus memvalidasi objek reportTrackingDetailSchema dengan 4 fase', () => {
      const mockDetail = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        trackingCode: 'SW-2026-T3ST',
        incidentType: 'karhutla',
        description: 'Kebakaran lahan gambut di pinggir jalan raya utama',
        observedAtIso: new Date().toISOString(),
        submittedAtIso: new Date().toISOString(),
        addressDisplay: 'Kecamatan Siak, Riau',
        maskedLocation: {
          latitude: 0.78912,
          longitude: 101.45678,
          approximateRadiusMeters: 800,
        },
        verificationStatus: 'verified',
        priority: 'high',
        handlingStatus: 'in_progress',
        clusterId: null,
        isPotentialDuplicate: false,
        satelliteHotspotMatched: true,
        evidence: {
          id: '223e4567-e89b-12d3-a456-426614174001',
          mediaUrl: 'https://cdn.siagawarga.id/evidence/fire-1.webp',
          mimeType: 'image/webp',
          fileSizeBytes: 450123,
          fileHashSha256:
            'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          exifCaptureTimeIso: new Date().toISOString(),
        },
        phases: [
          {
            phaseIndex: 1,
            phaseKey: 'received',
            title: 'Laporan Diterima',
            description: 'Laporan dan foto bukti berhasil diunggah.',
            status: 'completed',
            timestampIso: new Date().toISOString(),
            badgeLabel: 'Diterima',
          },
          {
            phaseIndex: 2,
            phaseKey: 'analyzed',
            title: 'Analisis Spasial & Satelit',
            description: 'Terindikasi selaras dengan data satelit NASA FIRMS.',
            status: 'completed',
            timestampIso: new Date().toISOString(),
            badgeLabel: 'Satelit Cocok',
          },
          {
            phaseIndex: 3,
            phaseKey: 'verified',
            title: 'Verifikasi Lapangan',
            description: 'Laporan dan bukti foto dinyatakan sah.',
            status: 'completed',
            timestampIso: new Date().toISOString(),
            badgeLabel: 'Terverifikasi Sah',
          },
          {
            phaseIndex: 4,
            phaseKey: 'handling',
            title: 'Tindak Lanjut Instansi',
            description: 'Operasi pemadaman sedang berlangsung.',
            status: 'in_progress',
            timestampIso: new Date().toISOString(),
            badgeLabel: 'Operasi Pemadaman',
          },
        ],
        auditHistory: [
          {
            id: '323e4567-e89b-12d3-a456-426614174002',
            statusType: 'verification',
            previousValue: 'pending',
            newValue: 'verified',
            changedBy: 'Petugas Verifikasi',
            reasonNote: 'Bukti foto jelas dan asap tampak tebal.',
            createdAtIso: new Date().toISOString(),
          },
        ],
      }

      const result = reportTrackingDetailSchema.safeParse(mockDetail)
      expect(result.success).toBe(true)
    })
  })

  describe('2. Deterministic Masked Coordinate Jittering (Rule 7)', () => {
    it('harus menghasilkan koordinat tersamar yang stabil untuk ID laporan yang sama', () => {
      const reportId = 'c0a80101-0000-0000-0000-000000000001'
      const lat = -6.2088
      const lon = 106.8456

      const result1 = calculateMaskedCoordinates(reportId, lat, lon)
      const result2 = calculateMaskedCoordinates(reportId, lat, lon)

      expect(result1.latitude).toBe(result2.latitude)
      expect(result1.longitude).toBe(result2.longitude)
      expect(result1.approximateRadiusMeters).toBe(800)
    })

    it('harus menghasilkan koordinat tersamar yang bergeser dalam radius aman (~300m - 1000m)', () => {
      const reportId = 'c0a80101-0000-0000-0000-000000000002'
      const lat = -0.7893
      const lon = 101.4567

      const masked = calculateMaskedCoordinates(reportId, lat, lon)

      // Perbedaan koordinat (derajat)
      const latDiff = Math.abs(masked.latitude - lat)
      const lonDiff = Math.abs(masked.longitude - lon)

      // 0.001 derajat lat kira-kira 111 meter
      // Offset harus di antara 0.001 s/d 0.01 derajat
      expect(latDiff).toBeGreaterThan(0.0005)
      expect(latDiff).toBeLessThan(0.01)
      expect(lonDiff).toBeGreaterThan(0.0005)
      expect(lonDiff).toBeLessThan(0.01)
    })

    it('harus menghasilkan koordinat berbeda untuk ID laporan yang berbeda', () => {
      const reportId1 = 'c0a80101-0000-0000-0000-000000000001'
      const reportId2 = 'c0a80101-0000-0000-0000-000000000099'
      const lat = -6.2
      const lon = 106.8

      const masked1 = calculateMaskedCoordinates(reportId1, lat, lon)
      const masked2 = calculateMaskedCoordinates(reportId2, lat, lon)

      expect(masked1.latitude !== masked2.latitude || masked1.longitude !== masked2.longitude).toBe(true)
    })
  })

  describe('3. Phase Calculation Logic (4-Phase Stepper)', () => {
    it('harus membentuk 4 fase dengan fase 1 selalu completed', () => {
      const now = new Date()
      const phases = buildTrackingPhases({
        submittedAt: now,
        observedAt: now,
        verificationStatus: 'pending',
        handlingStatus: 'not_forwarded',
        isPotentialDuplicate: false,
        satelliteHotspotMatched: false,
        auditHistory: [],
      })

      expect(phases).toHaveLength(4)
      expect(phases[0].phaseKey).toBe('received')
      expect(phases[0].status).toBe('completed')
      expect(phases[1].phaseKey).toBe('analyzed')
      expect(phases[1].status).toBe('completed')
      expect(phases[2].phaseKey).toBe('verified')
      expect(phases[2].status).toBe('in_progress')
      expect(phases[3].phaseKey).toBe('handling')
      expect(phases[3].status).toBe('pending')
    })

    it('harus menyesuaikan narasi fase 2 jika terdeteksi duplikat klaster atau satelit', () => {
      const now = new Date()
      const phasesCluster = buildTrackingPhases({
        submittedAt: now,
        observedAt: now,
        verificationStatus: 'verified',
        handlingStatus: 'in_progress',
        isPotentialDuplicate: true,
        satelliteHotspotMatched: false,
        auditHistory: [],
      })

      expect(phasesCluster[1].description).toContain('radius 2 km')

      const phasesSatellite = buildTrackingPhases({
        submittedAt: now,
        observedAt: now,
        verificationStatus: 'verified',
        handlingStatus: 'in_progress',
        isPotentialDuplicate: false,
        satelliteHotspotMatched: true,
        auditHistory: [],
      })

      expect(phasesSatellite[1].description).toContain('NASA FIRMS')
    })

    it('harus menandai fase 3 rejected jika status insufficient_evidence atau rejected', () => {
      const now = new Date()
      const phasesRejected = buildTrackingPhases({
        submittedAt: now,
        observedAt: now,
        verificationStatus: 'rejected',
        handlingStatus: 'not_forwarded',
        isPotentialDuplicate: false,
        satelliteHotspotMatched: false,
        auditHistory: [],
      })

      expect(phasesRejected[2].status).toBe('rejected')
      expect(phasesRejected[2].badgeLabel).toBe('Ditolak')
    })

    it('harus menandai fase 4 completed saat status resolved', () => {
      const now = new Date()
      const phasesResolved = buildTrackingPhases({
        submittedAt: now,
        observedAt: now,
        verificationStatus: 'verified',
        handlingStatus: 'resolved',
        isPotentialDuplicate: false,
        satelliteHotspotMatched: true,
        auditHistory: [],
      })

      expect(phasesResolved[3].status).toBe('completed')
      expect(phasesResolved[3].badgeLabel).toBe('Selesai / Teratasi')
    })
  })

  describe('4. Database & Server Function Integration', () => {
    it('harus mengembalikan null jika kode pelacakan tidak ditemukan', async () => {
      const result = await fetchReportByTrackingCode('SW-2026-ZZZZ')
      expect(result).toBeNull()
    })

    it('harus menyediakan server function getReportByTrackingCode yang terdefinisi', () => {
      expect(getReportByTrackingCode).toBeDefined()
      expect(typeof getReportByTrackingCode).toBe('function')
    })

    it('harus memvalidasi laporan nyata dari basis data dan menyaring data pribadi (PII)', async () => {
      // 1. Ambil salah satu laporan aktif dari database
      const existingReports = await db
        .select()
        .from(reports)
        .limit(1)

      if (existingReports.length > 0) {
        const targetReport = existingReports[0]
        const detail = await fetchReportByTrackingCode(targetReport.trackingCode)

        expect(detail).not.toBeNull()
        if (detail) {
          expect(detail.trackingCode).toBe(targetReport.trackingCode)
          expect(detail.description).toBe(targetReport.description)
          expect(detail.phases).toHaveLength(4)

          // Verifikasi tidak ada kebocoran PII (Rule 7)
          expect((detail as any).reporterPhone).toBeUndefined()
          expect((detail as any).reporterName).toBeUndefined()
          expect((detail as any).reporterUserId).toBeUndefined()

          // Koordinat publik harus berupa maskedLocation
          expect(detail.maskedLocation).toBeDefined()
          expect(typeof detail.maskedLocation.latitude).toBe('number')
          expect(typeof detail.maskedLocation.longitude).toBe('number')
        }
      }
    })
  })
})
