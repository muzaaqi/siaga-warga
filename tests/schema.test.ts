import { describe, expect, it } from 'bun:test'
import {
  createReportInputSchema,
  updateReportStatusInputSchema,
} from '@/lib/schema'

describe('Zod Isomorphic Schemas (SiagaWarga)', () => {
  it('should validate a valid report submission with mandatory r2ObjectKey and PRD fields', () => {
    const validData = {
      incidentType: 'karhutla',
      description:
        'Asap tebal membubung tinggi di dekat batas kebun warga desa.',
      observedAt: new Date().toISOString(),
      latitude: -0.5234,
      longitude: 101.4521,
      r2ObjectKey: 'reports/2026/03/foto-bukti-1.webp',
      fileHashSha256:
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      reporterPhone: '081234567890',
    }

    const result = createReportInputSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.incidentType).toBe('karhutla')
      expect(result.data.r2ObjectKey).toBe('reports/2026/03/foto-bukti-1.webp')
    }
  })

  it('should reject a report without mandatory r2ObjectKey (photo proof)', () => {
    const invalidData = {
      incidentType: 'permukiman',
      description: 'Kebakaran rumah warga di pinggir jalan raya permukiman.',
      observedAt: new Date().toISOString(),
      latitude: -6.2088,
      longitude: 106.8456,
      r2ObjectKey: '', // empty photo
    }

    const result = createReportInputSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      const photoError = result.error.issues.find(
        (issue) => issue.path[0] === 'r2ObjectKey',
      )
      expect(photoError?.message).toBe('Foto bukti wajib diunggah')
    }
  })

  it('should reject coordinates outside Indonesian boundary', () => {
    const outOfBoundsData = {
      incidentType: 'karhutla',
      description: 'Laporan uji coba kebakaran hutan palsu di kutub utara.',
      observedAt: new Date().toISOString(),
      latitude: 45.0, // Outside Indonesia (-11 to 6)
      longitude: 106.8,
      r2ObjectKey: 'reports/foto.webp',
    }

    const result = createReportInputSchema.safeParse(outOfBoundsData)
    expect(result.success).toBe(false)
    if (!result.success) {
      const latError = result.error.issues.find(
        (issue) => issue.path[0] === 'latitude',
      )
      expect(latError?.message).toBe(
        'Koordinat lintang di luar batas wilayah Indonesia',
      )
    }
  })

  it('should validate statusType enum and require a reason note when updating report status', () => {
    const invalidStatusUpdate = {
      reportId: '123e4567-e89b-12d3-a456-426614174000',
      statusType: 'invalid_status_type',
      newValue: 'verified',
      reasonNote: 'ok', // too short (< 5 chars)
    }

    const result = updateReportStatusInputSchema.safeParse(invalidStatusUpdate)
    expect(result.success).toBe(false)

    const validStatusUpdate = {
      reportId: '123e4567-e89b-12d3-a456-426614174000',
      statusType: 'verification',
      newValue: 'verified',
      reasonNote: 'Bukti foto jelas dan terkonfirmasi oleh satelit NASA',
    }

    const validResult =
      updateReportStatusInputSchema.safeParse(validStatusUpdate)
    expect(validResult.success).toBe(true)
  })
})
