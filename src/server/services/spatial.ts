import { sql } from 'drizzle-orm'
import type { db as defaultDb } from '@/server/db'

export interface NearbyReportMatch {
  id: string
  clusterId: string | null
  distanceMeters: number
}

export interface ClusterDeduplicationResult {
  isPotentialDuplicate: boolean
  clusterId: string
  matchedReportId?: string
}

/**
 * Menghasilkan kode pelacakan publik standar SiagaWarga.
 * Format: SW-YYYY-XXXX (contoh: SW-2026-X89B).
 * Menggunakan huruf besar dan angka tanpa karakter ambigu.
 */
export function generateTrackingCode(
  year: number = new Date().getFullYear(),
): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let randomSuffix = ''
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    randomSuffix += chars[randomIndex]
  }
  return `SW-${year}-${randomSuffix}`
}

/**
 * Logika penentuan klaster deduplikasi spasial (Rule 5 & PRD Section 5.2).
 * Jika terdapat laporan terdekat dalam radius <= 2000 meter, tautkan ke cluster_id yang sama.
 */
export function calculateClusterDeduplication(
  newReportId: string,
  nearbyMatch: NearbyReportMatch | null,
): ClusterDeduplicationResult {
  if (nearbyMatch && nearbyMatch.distanceMeters <= 2000) {
    return {
      isPotentialDuplicate: true,
      clusterId: nearbyMatch.clusterId || nearbyMatch.id,
      matchedReportId: nearbyMatch.id,
    }
  }

  return {
    isPotentialDuplicate: false,
    clusterId: newReportId,
  }
}

/**
 * Kueri spasial PostGIS untuk mencari laporan serupa terdekat dalam jendela waktu tertentu.
 * Menggunakan ekstensi PostGIS ST_DWithin dan ST_Distance dengan geografi WGS84 (SRID 4326).
 */
export async function findNearbyDuplicateReport(
  dbInstance: typeof defaultDb,
  latitude: number,
  longitude: number,
  radiusMeters: number = 2000,
  timeWindowHours: number = 4,
): Promise<NearbyReportMatch | null> {
  try {
    const timeWindow = `${timeWindowHours} hours`

    const queryResult = await dbInstance.execute(sql`
      SELECT 
        id::text AS id, 
        cluster_id::text AS cluster_id, 
        ST_Distance(
          location_geom::geography, 
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        ) AS distance_meters
      FROM reports
      WHERE 
        submitted_at >= NOW() - CAST(${timeWindow} AS INTERVAL)
        AND ST_DWithin(
          location_geom::geography, 
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, 
          ${radiusMeters}
        )
      ORDER BY distance_meters ASC
      LIMIT 1;
    `)

    const rows = queryResult as unknown as Array<{
      id: string
      cluster_id: string | null
      distance_meters: number | string
    }>

    if (rows.length > 0) {
      const match = rows[0]
      return {
        id: match.id,
        clusterId: match.cluster_id,
        distanceMeters: Number(match.distance_meters),
      }
    }

    return null
  } catch (error) {
    console.error(
      'Peringatan kueri spasial PostGIS, melanjutkan tanpa deduplikasi:',
      error,
    )
    return null
  }
}
