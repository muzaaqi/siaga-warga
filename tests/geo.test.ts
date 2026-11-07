import { describe, expect, it } from 'bun:test'
import {
  calculateHaversineDistanceKm,
  formatDistance,
  findNearestIncident,
} from '@/lib/geo'
import type {
  PublicMapReportItem,
  PublicMapHotspotItem,
} from '@/lib/schema/map'

describe('Spatial Geolocation & Proximity Tracking (Plan 14)', () => {
  describe('calculateHaversineDistanceKm', () => {
    it('harus mengembalikan 0 jika koordinat asal dan tujuan identik', () => {
      const distance = calculateHaversineDistanceKm(-6.1754, 106.8272, -6.1754, 106.8272)
      expect(distance).toBe(0)
    })

    it('harus menghitung jarak antara Monas (Jakarta) dan Gedung Sate (Bandung) secara akurat (~119 km)', () => {
      // Monas: -6.1754, 106.8272
      // Gedung Sate: -6.9025, 107.6186
      const distance = calculateHaversineDistanceKm(-6.1754, 106.8272, -6.9025, 107.6186)
      // Jarak garis lurus berkisar 119 - 120 km
      expect(distance).toBeGreaterThan(118)
      expect(distance).toBeLessThan(121)
    })

    it('harus menghitung jarak antarwilayah di Riau dan Sumatera Barat (Pekanbaru ke Padang ~198 km)', () => {
      // Pekanbaru: 0.5071, 101.4478
      // Padang: -0.9471, 100.4172
      const distance = calculateHaversineDistanceKm(0.5071, 101.4478, -0.9471, 100.4172)
      expect(distance).toBeGreaterThan(190)
      expect(distance).toBeLessThan(210)
    })
  })

  describe('formatDistance', () => {
    it('harus memformat jarak kurang dari 1 km ke dalam satuan meter', () => {
      expect(formatDistance(0)).toBe('0 m')
      expect(formatDistance(0.45)).toBe('450 m')
      expect(formatDistance(0.05)).toBe('50 m')
      expect(formatDistance(0.852)).toBe('852 m')
    })

    it('harus memformat jarak 1 km atau lebih ke dalam satuan kilometer berdesimal lokal Indonesia', () => {
      const dist1 = formatDistance(1.0)
      expect(dist1).toContain('1')
      expect(dist1).toContain('km')

      const dist2 = formatDistance(3.42)
      expect(dist2).toContain('3')
      expect(dist2).toContain('4')
      expect(dist2).toContain('km')

      const dist3 = formatDistance(15.78)
      expect(dist3).toContain('15')
      expect(dist3).toContain('8')
      expect(dist3).toContain('km')
    })
  })

  describe('findNearestIncident', () => {
    const userLocation = {
      latitude: -6.1754,
      longitude: 106.8272, // Monas, Jakarta
    }

    const mockReports: Array<PublicMapReportItem> = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        trackingCode: 'SW-2026-JKT1',
        incidentType: 'permukiman',
        description: 'Kebakaran rumah warga di Gambir',
        observedAtIso: '2026-11-07T02:00:00.000Z',
        submittedAtIso: '2026-11-07T02:05:00.000Z',
        latitude: -6.178,
        longitude: 106.83, // Sangat dekat (~0.4 km)
        addressDisplay: 'Gambir, Jakarta Pusat',
        handlingStatus: 'in_progress',
        thumbnailUrl: null,
      },
      {
        id: '22222222-2222-4222-8222-222222222222',
        trackingCode: 'SW-2026-BDG1',
        incidentType: 'karhutla',
        description: 'Asap tebal di perbukitan Lembang',
        observedAtIso: '2026-11-07T01:00:00.000Z',
        submittedAtIso: '2026-11-07T01:10:00.000Z',
        latitude: -6.82,
        longitude: 107.61, // Jauh di Bandung (~110 km)
        addressDisplay: 'Lembang, Bandung Barat',
        handlingStatus: 'forwarded',
        thumbnailUrl: null,
      },
    ]

    const mockHotspots: Array<PublicMapHotspotItem> = [
      {
        id: '33333333-3333-4333-8333-333333333333',
        source: 'VIIRS_SNPP',
        latitude: -6.19,
        longitude: 106.84, // Dekat (~2.1 km)
        brightness: 335.2,
        confidence: 'high',
        acquiredAtIso: '2026-11-07T00:30:00.000Z',
      },
      {
        id: '44444444-4444-4444-8444-444444444444',
        source: 'MODIS',
        latitude: -0.5,
        longitude: 101.5, // Sangat jauh di Riau
        brightness: 310.0,
        confidence: 'nominal',
        acquiredAtIso: '2026-11-07T00:00:00.000Z',
      },
    ]

    it('harus mengembalikan null jika daftar laporan dan hotspot kosong', () => {
      const nearest = findNearestIncident(userLocation, [], [])
      expect(nearest).toBeNull()
    })

    it('harus memilih laporan warga terdekat jika jaraknya lebih dekat dari hotspot satelit', () => {
      const nearest = findNearestIncident(userLocation, mockReports, mockHotspots)
      expect(nearest).not.toBeNull()
      expect(nearest?.type).toBe('report')
      expect(nearest?.id).toBe(mockReports[0].id)
      expect(nearest?.trackingCode).toBe('SW-2026-JKT1')
      expect(nearest?.distanceKm).toBeLessThan(1)
    })

    it('harus memilih hotspot satelit jika jaraknya lebih dekat daripada seluruh laporan warga', () => {
      // Geser user mendekati hotspot satelit (Menteng)
      const userNearHotspot = {
        latitude: -6.191,
        longitude: 106.841,
      }
      const nearest = findNearestIncident(userNearHotspot, mockReports, mockHotspots)
      expect(nearest).not.toBeNull()
      expect(nearest?.type).toBe('hotspot')
      expect(nearest?.id).toBe(mockHotspots[0].id)
      expect(nearest?.distanceKm).toBeLessThan(0.5)
    })
  })
})
