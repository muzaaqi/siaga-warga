import { describe, expect, it } from 'bun:test'
import {
  getNewsFeedInputSchema,
  newsFeedItemSchema,
  newsFeedResponseSchema,
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
        expect(result.data.cursor).toBeUndefined()
        expect(result.data.search).toBeUndefined()
      }
    })

    it('harus menerima parameter query yang valid dengan kata kunci pencarian', () => {
      const result = getNewsFeedInputSchema.safeParse({
        limit: 15,
        search: 'Pekanbaru',
        cursor: '2026-10-29T04:00:00.000Z',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limit).toBe(15)
        expect(result.data.search).toBe('Pekanbaru')
        expect(result.data.cursor).toBe('2026-10-29T04:00:00.000Z')
      }
    })

    it('harus menolak limit kurang dari 1 atau lebih dari 30', () => {
      const lowResult = getNewsFeedInputSchema.safeParse({ limit: 0 })
      expect(lowResult.success).toBe(false)

      const highResult = getNewsFeedInputSchema.safeParse({ limit: 50 })
      expect(highResult.success).toBe(false)
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

    it('harus mengembalikan respons feed hanya laporan yang berstatus terverifikasi', async () => {
      const response = await fetchPublicNewsFeed({
        limit: 5,
      })

      expect(response).toBeDefined()
      expect(Array.isArray(response.items)).toBe(true)
      expect(typeof response.hasMore).toBe('boolean')

      // Seluruh laporan yang tampil harus berstatus verified
      for (const item of response.items) {
        expect(item.verificationStatus).toBe('verified')
        expect(item.trackingCode).toMatch(/^SW-\d{4}-[A-Z0-9]+$/)
        expect(item.reporter).toBeDefined()
        expect(typeof item.latitude).toBe('number')
        expect(typeof item.longitude).toBe('number')
      }
    })

    it('harus mendukung penyaringan pencarian teks pada fetchPublicNewsFeed', async () => {
      const searchResponse = await fetchPublicNewsFeed({
        limit: 5,
        search: 'SW-',
      })

      expect(searchResponse).toBeDefined()
      expect(Array.isArray(searchResponse.items)).toBe(true)
      for (const item of searchResponse.items) {
        expect(item.verificationStatus).toBe('verified')
      }
    })
  })
})
