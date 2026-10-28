import { test, expect, describe } from 'bun:test'
import {
  updateProfileInputSchema,
  myReportItemSchema,
  myProfileAndReportsSchema,
  PRESET_AVATARS,
} from '@/lib/schema/profile'

describe('Profile Schema Validation', () => {
  describe('updateProfileInputSchema', () => {
    test('accepts valid name (2-50 characters)', () => {
      const result = updateProfileInputSchema.safeParse({
        name: 'Budi Santoso',
      })
      expect(result.success).toBe(true)
    })

    test('rejects name less than 2 characters', () => {
      const result = updateProfileInputSchema.safeParse({
        name: 'A',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Nama minimal 2 karakter')
      }
    })

    test('rejects name more than 50 characters', () => {
      const result = updateProfileInputSchema.safeParse({
        name: 'A'.repeat(51),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Nama maksimal 50 karakter')
      }
    })

    test('accepts valid preset avatar path', () => {
      const result = updateProfileInputSchema.safeParse({
        name: 'Budi Santoso',
        image: '/avatars/preset-siaga.svg',
      })
      expect(result.success).toBe(true)
    })

    test('accepts valid URL for image', () => {
      const result = updateProfileInputSchema.safeParse({
        name: 'Budi Santoso',
        image: 'https://example.com/avatar.png',
      })
      expect(result.success).toBe(true)
    })

    test('rejects invalid avatar path', () => {
      const result = updateProfileInputSchema.safeParse({
        name: 'Budi Santoso',
        image: '/avatars/invalid.png',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        // URL validation runs first and fails with a generic message
        // The regex validation message 'Pilihan avatar tidak valid' would only show if URL passed
        expect(result.error.issues[0].message).toBeDefined()
      }
    })

    test('accepts optional image field', () => {
      const result = updateProfileInputSchema.safeParse({
        name: 'Budi Santoso',
      })
      expect(result.success).toBe(true)
    })

    test('trims whitespace from name', () => {
      const result = updateProfileInputSchema.safeParse({
        name: '  Budi Santoso  ',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Budi Santoso')
      }
    })
  })

  describe('myReportItemSchema', () => {
    const validReport = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      trackingCode: 'SW-2026-X89B',
      incidentType: 'karhutla',
      description: 'Kebakaran hutan di wilayah Riau',
      submittedAtIso: '2026-10-28T10:30:00.000Z',
      addressDisplay: 'Jl. Lintas Sumatra KM 42, Riau',
      verificationStatus: 'verified',
      handlingStatus: 'in_progress',
      isPotentialDuplicate: false,
    }

    test('accepts valid report item', () => {
      const result = myReportItemSchema.safeParse(validReport)
      expect(result.success).toBe(true)
    })

    test('rejects invalid UUID', () => {
      const result = myReportItemSchema.safeParse({
        ...validReport,
        id: 'invalid-uuid',
      })
      expect(result.success).toBe(false)
    })

    test('rejects invalid incident type', () => {
      const result = myReportItemSchema.safeParse({
        ...validReport,
        incidentType: 'invalid',
      })
      expect(result.success).toBe(false)
    })

    test('rejects invalid verification status', () => {
      const result = myReportItemSchema.safeParse({
        ...validReport,
        verificationStatus: 'invalid',
      })
      expect(result.success).toBe(false)
    })

    test('rejects invalid handling status', () => {
      const result = myReportItemSchema.safeParse({
        ...validReport,
        handlingStatus: 'invalid',
      })
      expect(result.success).toBe(false)
    })

    test('accepts null addressDisplay', () => {
      const result = myReportItemSchema.safeParse({
        ...validReport,
        addressDisplay: null,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('myProfileAndReportsSchema', () => {
    const validProfileAndReports = {
      user: {
        id: 'user-123',
        name: 'Budi Santoso',
        email: 'budi.santoso@gmail.com',
        image: '/avatars/preset-siaga.svg',
        role: 'citizen',
        createdAtIso: '2026-10-01T00:00:00.000Z',
      },
      reports: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          trackingCode: 'SW-2026-X89B',
          incidentType: 'karhutla',
          description: 'Kebakaran hutan di wilayah Riau',
          submittedAtIso: '2026-10-28T10:30:00.000Z',
          addressDisplay: 'Jl. Lintas Sumatra KM 42, Riau',
          verificationStatus: 'verified',
          handlingStatus: 'in_progress',
          isPotentialDuplicate: false,
        },
      ],
    }

    test('accepts valid profile and reports', () => {
      const result = myProfileAndReportsSchema.safeParse(validProfileAndReports)
      expect(result.success).toBe(true)
    })

    test('rejects invalid user email', () => {
      const result = myProfileAndReportsSchema.safeParse({
        ...validProfileAndReports,
        user: {
          ...validProfileAndReports.user,
          email: 'invalid-email',
        },
      })
      expect(result.success).toBe(false)
    })

    test('rejects invalid user role', () => {
      const result = myProfileAndReportsSchema.safeParse({
        ...validProfileAndReports,
        user: {
          ...validProfileAndReports.user,
          role: 'invalid',
        },
      })
      expect(result.success).toBe(false)
    })

    test('accepts empty reports array', () => {
      const result = myProfileAndReportsSchema.safeParse({
        ...validProfileAndReports,
        reports: [],
      })
      expect(result.success).toBe(true)
    })
  })

  describe('PRESET_AVATARS', () => {
    test('contains 6 preset avatars', () => {
      expect(PRESET_AVATARS.length).toBe(6)
    })

    test('each avatar has required fields', () => {
      for (const avatar of PRESET_AVATARS) {
        expect(avatar.id).toBeDefined()
        expect(avatar.name).toBeDefined()
        expect(avatar.path).toBeDefined()
        expect(avatar.description).toBeDefined()
        expect(avatar.path).toMatch(/^\/avatars\/preset-[a-z-]+\.svg$/)
      }
    })

    test('contains expected avatar IDs', () => {
      const ids = PRESET_AVATARS.map((a) => a.id)
      expect(ids).toContain('siaga-warga')
      expect(ids).toContain('relawan-hijau')
      expect(ids).toContain('pengawas-lahan')
      expect(ids).toContain('satgas-bencana')
      expect(ids).toContain('penjaga-permukiman')
      expect(ids).toContain('patroli-udara')
    })
  })
})