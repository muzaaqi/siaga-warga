import type {
  PublicMapReportItem,
  PublicMapHotspotItem,
} from '@/lib/schema/map'

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface NearestIncidentResult {
  type: 'report' | 'hotspot'
  id: string
  title: string
  distanceKm: number
  latitude: number
  longitude: number
  statusLabel?: string
  trackingCode?: string
}

/**
 * Menghitung jarak lingkaran besar antara dua koordinat geografis
 * menggunakan formula Haversine (dalam kilometer).
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371 // Radius bumi rata-rata dalam kilometer
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 100) / 100
}

/**
 * Format jarak yang manusiawi (misal: "850 m" atau "3,4 km").
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000)
    return `${meters} m`
  }
  return `${distanceKm.toLocaleString('id-ID', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} km`
}

/**
 * Memindai laporan warga dan hotspot satelit terdekat dari koordinat pengguna.
 */
export function findNearestIncident(
  userCoords: Coordinates,
  reports: Array<PublicMapReportItem>,
  hotspots: Array<PublicMapHotspotItem>,
): NearestIncidentResult | null {
  let nearest: NearestIncidentResult | null = null
  let minDistance = Number.POSITIVE_INFINITY

  for (const report of reports) {
    const dist = calculateHaversineDistanceKm(
      userCoords.latitude,
      userCoords.longitude,
      report.latitude,
      report.longitude,
    )
    if (dist < minDistance) {
      minDistance = dist
      nearest = {
        type: 'report',
        id: report.id,
        title: `Laporan ${report.trackingCode} (${report.incidentType})`,
        distanceKm: dist,
        latitude: report.latitude,
        longitude: report.longitude,
        trackingCode: report.trackingCode,
        statusLabel: report.handlingStatus,
      }
    }
  }

  for (const hotspot of hotspots) {
    const dist = calculateHaversineDistanceKm(
      userCoords.latitude,
      userCoords.longitude,
      hotspot.latitude,
      hotspot.longitude,
    )
    if (dist < minDistance) {
      minDistance = dist
      nearest = {
        type: 'hotspot',
        id: hotspot.id,
        title: `Hotspot Satelit ${hotspot.source}`,
        distanceKm: dist,
        latitude: hotspot.latitude,
        longitude: hotspot.longitude,
        statusLabel: hotspot.confidence ?? 'nominal',
      }
    }
  }

  return nearest
}
