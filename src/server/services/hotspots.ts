import { desc, gte, sql } from 'drizzle-orm'
import { db } from '@/server/db'
import type { NewSatelliteHotspot } from '@/server/db/schema/hotspots'
import { satelliteHotspots } from '@/server/db/schema/hotspots'
import { getServerEnv } from '@/server/env'
import type { PublicMapHotspotItem } from '@/lib/schema/map'

/**
 * Pengurai CSV data NRT NASA FIRMS menjadi entri objek terstruktur.
 * Format baris CSV standar NASA FIRMS:
 * country_id,latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight
 */
export const MAX_HOTSPOTS_PER_SYNC = 1000

export function parseNasaFirmsCsv(csvText: string): Array<NewSatelliteHotspot> {
  const lines = csvText.split('\n')
  const results: Array<NewSatelliteHotspot> = []

  // Lewati baris 0 (header)
  for (let i = 1; i < lines.length; i++) {
    if (results.length >= MAX_HOTSPOTS_PER_SYNC) {
      break
    }

    const line = lines[i]?.trim()
    if (!line) continue

    const parts = line.split(',')
    if (parts.length < 11) continue

    const lat = Number(parts[1])
    const lon = Number(parts[2])
    const brightTi4 = parts[3] ? Number(parts[3]) : null
    const acqDate = parts[6]?.trim() // e.g. '2026-11-06'
    let acqTime = parts[7]?.trim() // e.g. '0430'
    const instrument = parts[9]?.trim() // e.g. 'VIIRS'
    const confidence = parts[10]?.trim() || null

    // Validasi koordinat batas wilayah Indonesia (Lat: -11 s/d 6, Lon: 95 s/d 141)
    if (
      Number.isNaN(lat) ||
      Number.isNaN(lon) ||
      lat < -11 ||
      lat > 6 ||
      lon < 95 ||
      lon > 141
    ) {
      continue
    }

    // Susun waktu akuisisi UTC yang valid
    if (!acqDate || !acqTime) continue
    while (acqTime.length < 4) {
      acqTime = `0${acqTime}`
    }
    const hour = acqTime.slice(0, 2)
    const minute = acqTime.slice(2, 4)
    const isoString = `${acqDate}T${hour}:${minute}:00.000Z`
    const acquiredAt = new Date(isoString)

    if (Number.isNaN(acquiredAt.getTime())) {
      continue
    }

    const source =
      instrument.toUpperCase() === 'MODIS' ? 'MODIS' : 'VIIRS_SNPP'

    results.push({
      source,
      latitude: lat,
      longitude: lon,
      brightness: Number.isNaN(brightTi4) ? null : brightTi4,
      confidence,
      acquiredAt,
    })
  }

  return results
}

/**
 * Variabel penahan sinkronisasi aktif untuk mencegah serangan Cache Stampede.
 */
let activeSyncPromise: Promise<number> | null = null

/**
 * Menyinkronkan titik panas dari API NASA FIRMS ke tabel basis data PostGIS (Rule 6).
 */
export async function syncNasaFirmsHotspots(): Promise<number> {
  // Jika sinkronisasi sedang berjalan, tunggu promise yang sama (cegah stampede)
  if (activeSyncPromise) {
    return activeSyncPromise
  }

  activeSyncPromise = (async () => {
    // Lewati panggilan keluar saat pengujian unit otomatis
    if (process.env.NODE_ENV === 'test') {
      return 0
    }

    let mapKey: string | undefined
    try {
      const env = getServerEnv()
      mapKey = env.NASA_FIRMS_MAP_KEY
    } catch {
      // Tidak apa-apa jika env server belum terkonfigurasi saat pengujian
    }

    // Abaikan jika kunci belum diisi atau masih menggunakan placeholder bawaan
    if (!mapKey || mapKey === 'your-nasa-firms-map-key' || mapKey.startsWith('your-')) {
      return 0
    }

    const safeKey = encodeURIComponent(mapKey.trim())
    const endpoint = `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${safeKey}/VIIRS_SNPP_NRT/IDN/1`

    try {
      const response = await fetch(endpoint, {
        headers: {
          Accept: 'text/csv',
        },
        signal: AbortSignal.timeout(5000),
      })

      if (!response.ok) {
        console.warn(`NASA FIRMS API mengembalikan HTTP ${response.status}`)
        return 0
      }

      const csvText = await response.text()
      const hotspots = parseNasaFirmsCsv(csvText)

      if (hotspots.length === 0) {
        return 0
      }

      // Simpan dalam pecahan batch (100 per kueri) guna mereduksi round-trip database
      const BATCH_SIZE = 100
      for (let i = 0; i < hotspots.length; i += BATCH_SIZE) {
        const chunk = hotspots.slice(i, i + BATCH_SIZE)
        const rowsToInsert = chunk.map((spot) => ({
          source: spot.source,
          latitude: spot.latitude,
          longitude: spot.longitude,
          geom: sql`ST_SetSRID(ST_MakePoint(${spot.longitude}, ${spot.latitude}), 4326)`,
          brightness: spot.brightness,
          confidence: spot.confidence,
          acquiredAt: spot.acquiredAt,
          fetchedAt: new Date(),
        }))

        await db
          .insert(satelliteHotspots)
          .values(rowsToInsert)
          .onConflictDoNothing()
      }

      return hotspots.length
    } catch (error) {
      console.warn('Kendala jaringan saat sinkronisasi NASA FIRMS:', error)
      return 0
    }
  })()

  try {
    return await activeSyncPromise
  } finally {
    activeSyncPromise = null
  }
}

/**
 * Mengambil data titik panas satelit NASA FIRMS dengan caching 6 jam (Rule 6).
 */
export async function getOrSyncSatelliteHotspots(
  timeRangeHours: number = 24,
): Promise<Array<PublicMapHotspotItem>> {
  // 1. Cek kesegaran cache lokal di PostGIS
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000)

  try {
    const latestFetch = await db
      .select({ fetchedAt: satelliteHotspots.fetchedAt })
      .from(satelliteHotspots)
      .orderBy(desc(satelliteHotspots.fetchedAt))
      .limit(1)

    const isCacheStale =
      latestFetch.length === 0 || latestFetch[0].fetchedAt < sixHoursAgo

    // 2. Jika cache sudah kedaluwarsa, coba sinkronisasi dari API NASA FIRMS
    if (isCacheStale) {
      await syncNasaFirmsHotspots()
    }

    // 3. Ambil data titik panas berdasarkan batas rentang waktu
    const timeLimit = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000)

    const records = await db
      .select()
      .from(satelliteHotspots)
      .where(gte(satelliteHotspots.acquiredAt, timeLimit))
      .orderBy(desc(satelliteHotspots.acquiredAt))
      .limit(200)

    return records.map((r) => ({
      id: r.id,
      source: r.source,
      latitude: r.latitude,
      longitude: r.longitude,
      brightness: r.brightness,
      confidence: r.confidence,
      acquiredAtIso: r.acquiredAt.toISOString(),
    }))
  } catch (error) {
    console.warn('Gagal membaca tabel satellite_hotspots di database:', error)
    return []
  }
}
