import { describe, expect, it } from 'bun:test'
import {
  createReportInputSchema,
  updateReportStatusInputSchema,
} from '@/lib/schema'

describe('Zod Isomorphic Schemas (SiagaWarga)', () => {
  it('should validate a valid report submission with photo storageKey', () => {
    const validData = {
      fireType: 'karhutla',
      description: 'Asap tebal membubung tinggi di dekat batas kebun warga.',
      latitude: -0.5234,
      longitude: 101.4521,
      storageKey: 'reports/2026/03/foto-bukti-1.webp',
      reporterPhone: '081234567890',
    }

    const result = createReportInputSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.fireType).toBe('karhutla')
      expect(result.data.storageKey).toBe('reports/2026/03/foto-bukti-1.webp')
    }
  })

  it('should reject a report without mandatory storageKey (photo proof)', () => {
    const invalidData = {
      fireType: 'residential',
      description: 'Kebakaran rumah warga di pinggir jalan raya.',
      latitude: -6.2088,
      longitude: 106.8456,
      storageKey: '', // empty photo
    }

    const result = createReportInputSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      const storageKeyError = result.error.issues.find(
        (issue) => issue.path[0] === 'storageKey',
      )
      expect(storageKeyError?.message).toBe('Foto bukti wajib diunggah')
    }
  })

  it('should reject coordinates outside Indonesian boundary', () => {
    const outOfBoundsData = {
      fireType: 'karhutla',
      description: 'Laporan uji coba kebakaran hutan palsu di kutub.',
      latitude: 45.0, // Outside Indonesia (-11 to 6)
      longitude: 106.8,
      storageKey: 'reports/foto.webp',
    }

    const result = createReportInputSchema.safeParse(outOfBoundsData)
    expect(result.success).toBe(false)
    if (!result.success) {
      const latError = result.error.issues.find(
        (issue) => issue.path[0] === 'latitude',
      )
      expect(latError?.message).toBe(
        'Koordinat lintang di luar wilayah Indonesia',
      )
    }
  })

  it('should require a reason note when updating report status', () => {
    const invalidStatusUpdate = {
      reportId: '123e4567-e89b-12d3-a456-426614174000',
      verificationStatus: 'verified',
      reasonNote: 'ok', // too short (< 5 chars)
    }

    const result = updateReportStatusInputSchema.safeParse(invalidStatusUpdate)
    expect(result.success).toBe(false)
  })
})
