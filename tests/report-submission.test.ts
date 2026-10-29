import { describe, expect, it } from 'bun:test'
import {
  createReportInputSchema,
  getUploadUrlInputSchema,
  submitReportResponseSchema,
} from '@/lib/schema'
import { generateR2PresignedPutUrl } from '@/server/services/r2'
import {
  calculateClusterDeduplication,
  generateTrackingCode,
} from '@/server/services/spatial'

describe('Plan 03: Citizen Incident Reporting', () => {
  describe('Zod Validation Schemas', () => {
    it('harus menerima data laporan lengkap dengan koordinat wilayah Indonesia dan foto bukti', () => {
      const validPayload = {
        incidentType: 'karhutla',
        description:
          'Kebakaran lahan gambut dengan kepulan asap tebal terlihat dari jalan utama.',
        observedAt: new Date().toISOString(),
        latitude: -0.5021, // Riau (Indonesia)
        longitude: 101.4478,
        addressDisplay: 'Jl. Lintas Siak KM 12, Riau',
        r2ObjectKey: 'evidence/test-photo-uuid.webp',
        fileHashSha256: 'a'.repeat(64),
        exifCaptureTime: new Date().toISOString(),
        reporterName: 'Warga Peduli',
        reporterPhone: '081234567890',
        isAnonymous: false,
      }

      const result = createReportInputSchema.safeParse(validPayload)
      expect(result.success).toBe(true)
    })

    it('harus menolak laporan tanpa r2ObjectKey (foto bukti wajib per Rule 4)', () => {
      const invalidPayload = {
        incidentType: 'permukiman',
        description: 'Kebakaran rumah warga di pemukiman padat penduduk.',
        observedAt: new Date().toISOString(),
        latitude: -6.2088,
        longitude: 106.8456,
        r2ObjectKey: '', // Kosong!
      }

      const result = createReportInputSchema.safeParse(invalidPayload)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes('r2ObjectKey')),
        ).toBe(true)
      }
    })

    it('harus menolak koordinat di luar batas wilayah Indonesia', () => {
      const outOfBoundsPayload = {
        incidentType: 'karhutla',
        description: 'Titik api terdeteksi di koordinat tidak valid.',
        observedAt: new Date().toISOString(),
        latitude: 35.6762, // Tokyo, Jepang (di luar Indonesia)
        longitude: 139.6503,
        r2ObjectKey: 'evidence/photo.webp',
      }

      const result = createReportInputSchema.safeParse(outOfBoundsPayload)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes('latitude')),
        ).toBe(true)
      }
    })

    it('harus menolak deskripsi kejadian yang kurang dari 15 karakter', () => {
      const shortDescPayload = {
        incidentType: 'permukiman',
        description: 'Ada api', // < 15 karakter
        observedAt: new Date().toISOString(),
        latitude: -6.2088,
        longitude: 106.8456,
        r2ObjectKey: 'evidence/photo.webp',
      }

      const result = createReportInputSchema.safeParse(shortDescPayload)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes('description')),
        ).toBe(true)
      }
    })

    it('harus memvalidasi parameter permintaan presigned URL unggah foto', () => {
      const validUploadReq = {
        filename: 'bukti-kebakaran.webp',
        mimeType: 'image/webp',
        fileSize: 1024 * 500, // 500 KB
        checksum: 'b'.repeat(64),
      }

      const result = getUploadUrlInputSchema.safeParse(validUploadReq)
      expect(result.success).toBe(true)

      const invalidMimeReq = {
        filename: 'skrip.sh',
        mimeType: 'application/x-sh',
        fileSize: 1024,
      }
      expect(getUploadUrlInputSchema.safeParse(invalidMimeReq).success).toBe(
        false,
      )

      const oversizedReq = {
        filename: 'besar.jpeg',
        mimeType: 'image/jpeg',
        fileSize: 6 * 1024 * 1024, // 6 MB (maks 5 MB)
      }
      expect(getUploadUrlInputSchema.safeParse(oversizedReq).success).toBe(
        false,
      )
    })
  })

  describe('Tracking Code & Deduplication Logic', () => {
    it('harus menghasilkan kode pelacakan dengan format SW-YYYY-XXXX alfanumerik huruf besar', () => {
      const year = new Date().getFullYear()
      const code = generateTrackingCode(year)
      expect(code).toMatch(new RegExp(`^SW-${year}-[A-Z0-9]{4}$`))
    })

    it('harus mengaitkan laporan ke klaster yang sudah ada jika jarak <= 2000 meter', () => {
      const existingClusterId = '11111111-1111-1111-1111-111111111111'
      const newReportId = '22222222-2222-2222-2222-222222222222'

      const result = calculateClusterDeduplication(newReportId, {
        id: 'existing-report-1',
        clusterId: existingClusterId,
        distanceMeters: 450, // 450 meter <= 2000 meter
      })

      expect(result.isPotentialDuplicate).toBe(true)
      expect(result.clusterId).toBe(existingClusterId)
    })

    it('harus membuat klaster baru jika tidak ada laporan lain dalam radius 2000 meter', () => {
      const newReportId = '22222222-2222-2222-2222-222222222222'

      const result = calculateClusterDeduplication(newReportId, null)

      expect(result.isPotentialDuplicate).toBe(false)
      expect(result.clusterId).toBe(newReportId)
    })
  })

  describe('Cloudflare R2 Presigned PUT URL Generator', () => {
    it('harus menghasilkan URL PUT presigned yang valid atau fallback lokal aman', async () => {
      const presigned = await generateR2PresignedPutUrl({
        key: 'evidence/test-photo.webp',
        mimeType: 'image/webp',
        expiresInSeconds: 900,
      })

      expect(presigned.uploadUrl).toBeDefined()
      expect(presigned.r2ObjectKey).toBe('evidence/test-photo.webp')
      expect(presigned.uploadUrl.startsWith('http')).toBe(true)
    })
  })

  describe('Server Functions Integration (Neon PostgreSQL)', () => {
    it('harus memproses pendaftaran laporan baru dan mengembalikan tracking code unik', async () => {
      const { processCitizenReport } = await import('@/server/services/reports')
      const { db } = await import('@/server/db')
      const { reports } = await import('@/server/db/schema/reports')
      const { eq } = await import('drizzle-orm')

      const testPayload = {
        incidentType: 'karhutla' as const,
        description: 'Uji integrasi sistem pelaporan insiden kebakaran warga.',
        observedAt: new Date().toISOString(),
        latitude: -0.5021,
        longitude: 101.4478,
        addressDisplay: 'Kawasan Konservasi Hutan Riau',
        r2ObjectKey: `evidence/test-${Date.now()}.webp`,
        fileHashSha256: 'c'.repeat(64),
        isAnonymous: true,
      }

      const response = await processCitizenReport(testPayload, null)

      expect(submitReportResponseSchema.safeParse(response).success).toBe(true)
      expect(response.reportId).toBeDefined()
      expect(response.trackingCode).toMatch(/^SW-\d{4}-[A-Z0-9]{4}$/)
      expect(response.clusterId).toBeDefined()

      // Verifikasi record tersimpan di database Neon
      const [saved] = await db
        .select()
        .from(reports)
        .where(eq(reports.id, response.reportId))
        .limit(1)

      expect(saved).toBeDefined()
      expect(saved.trackingCode).toBe(response.trackingCode)
      expect(saved.incidentType).toBe('karhutla')

      // Bersihkan data uji
      await db.delete(reports).where(eq(reports.id, response.reportId))
    })
  })
})
