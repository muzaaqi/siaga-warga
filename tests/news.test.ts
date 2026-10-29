import { describe, expect, it } from 'bun:test'
import {
  getNewsFeedInputSchema,
  newsFeedItemSchema,
  newsFeedResponseSchema,
  newsFilterEnum,
} from '@/lib/schema/news'
import { getPublicNewsFeed } from '@/server/functions/news'
import { fetchPublicNewsFeed } from '@/server/services/news'

describe('Plan 05: Public Incident News Feed', () => {
  describe('Zod Validation Schemas', () => {
    it('harus mengisi nilai default ketika menerima input kosong', () => {
      const result = getNewsFeedInputSchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limit).toBe(10)
        expect(result.data.filter).toBe('all')
        expect(result.data.cursor).toBeUndefined()
      }
    })

    it('harus menerima parameter query yang valid', () => {
      const result = getNewsFeedInputSchema.safeParse({
        limit: 15,
        filter: 'verified',
        cursor: '2026-10-29T04:00:00.000Z',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limit).toBe(15)
        expect(result.data.filter).toBe('verified')
        expect(result.data.cursor).toBe('2026-10-29T04:00:00.000Z')
      }
    })

    it('harus menolak filter di luar enum yang diizinkan', () => {
      const result = getNewsFeedInputSchema.safeParse({
        filter: 'invalid_filter',
      })
      expect(result.success).toBe(false)
    })

    it('harus menolak limit kurang dari 1 atau lebih dari 30', () => {
      const lowResult = getNewsFeedInputSchema.safeParse({ limit: 0 })
      expect(lowResult.success).toBe(false)

      const highResult = getNewsFeedInputSchema.safeParse({ limit: 50 })
      expect(highResult.success).toBe(false)
    })

    it('harus memvalidasi enum newsFilterEnum dengan benar', () => {
      expect(newsFilterEnum.safeParse('all').success).toBe(true)
      expect(newsFilterEnum.safeParse('verified').success).toBe(true)
      expect(newsFilterEnum.safeParse('in_progress').success).toBe(true)
      expect(newsFilterEnum.safeParse('resolved').success).toBe(true)
      expect(newsFilterEnum.safeParse('rejected').success).toBe(false)
    })

    it('harus memvalidasi objek newsFeedItemSchema yang valid', () => {
      const sampleItem = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        trackingCode: 'SW-2026-X89B',
        incidentType: 'karhutla',
        description:
          'Terlihat kepulan asap pekat membubung tinggi di area lahan gambut',
        submittedAtIso: '2026-10-29T04:00:00.000Z',
        addressDisplay: 'Kecamatan Tampan, Kota Pekanbaru',
        verificationStatus: 'verified',
        handlingStatus: 'in_progress',
        latitude: -0.5,
        longitude: 101.44,
        primaryImageUrl: 'https://r2.siagawarga.id/evidence/sample.webp',
        reporter: {
          id: 'usr-123',
          name: 'Budi Santoso',
          image: '/avatars/preset-siaga.svg',
          role: 'citizen',
        },
      }

      const result = newsFeedItemSchema.safeParse(sampleItem)
      expect(result.success).toBe(true)
    })

    it('harus memvalidasi newsFeedResponseSchema', () => {
      const sampleResponse = {
        items: [],
        nextCursor: null,
        hasMore: false,
      }
      const result = newsFeedResponseSchema.safeParse(sampleResponse)
      expect(result.success).toBe(true)
    })
  })

  describe('Business Logic & Server Functions', () => {
    it('harus menyediakan server function getPublicNewsFeed yang terdefinisi', () => {
      expect(getPublicNewsFeed).toBeDefined()
    })

    it('harus mengembalikan respons feed dari database dengan format yang valid', async () => {
      const response = await fetchPublicNewsFeed({
        limit: 5,
        filter: 'all',
      })

      expect(response).toBeDefined()
      expect(Array.isArray(response.items)).toBe(true)
      expect(typeof response.hasMore).toBe('boolean')

      // Jika ada item laporan di basis data dev/test, validasi strukturnya
      if (response.items.length > 0) {
        const first = response.items[0]
        expect(first.trackingCode).toMatch(/^SW-\d{4}-[A-Z0-9]+$/)
        expect(first.reporter).toBeDefined()
        expect(typeof first.latitude).toBe('number')
        expect(typeof first.longitude).toBe('number')
      }
    })
  })
})
