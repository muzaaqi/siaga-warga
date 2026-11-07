import { and, desc, eq, gte, inArray } from 'drizzle-orm'
import { db } from '@/server/db'
import { reports, reportEvidence } from '@/server/db/schema'
import { calculateMaskedCoordinates } from '@/server/services/tracking'
import { getOrSyncSatelliteHotspots } from '@/server/services/hotspots'
import type {
  PublicMapQuery,
  PublicMapReportItem,
  PublicMapDataResponse,
} from '@/lib/schema/map'

/**
 * Mengambil data gabungan insiden warga terverifikasi dan titik panas satelit NASA
 * untuk ditampilkan pada peta publik interaktif /pantau.
 * Menegakkan Rule 7 (Zero PII leakage) & Rule 6 (NASA FIRMS caching).
 */
export async function fetchPublicMapData(
  query: PublicMapQuery,
): Promise<PublicMapDataResponse> {
  const { incidentType, timeRange, handlingStatus } = query

  // Konversi rentang waktu ke jam
  const hours = timeRange === '7d' ? 168 : timeRange === '3d' ? 72 : 24
  const timeLimit = new Date(Date.now() - hours * 60 * 60 * 1000)

  // 1. Susun filter untuk laporan warga terverifikasi
  const conditions = [
    eq(reports.verificationStatus, 'verified'),
    gte(reports.submittedAt, timeLimit),
  ]

  if (incidentType !== 'all') {
    conditions.push(eq(reports.incidentType, incidentType as any))
  }

  if (handlingStatus !== 'all') {
    conditions.push(eq(reports.handlingStatus, handlingStatus as any))
  }

  // 2. Query laporan warga terverifikasi (tanpa join bukti untuk menghindari penggandaan baris)
  const verifiedReports = await db
    .select({
      id: reports.id,
      trackingCode: reports.trackingCode,
      incidentType: reports.incidentType,
      description: reports.description,
      observedAt: reports.observedAt,
      submittedAt: reports.submittedAt,
      latitude: reports.latitude,
      longitude: reports.longitude,
      addressDisplay: reports.addressDisplay,
      handlingStatus: reports.handlingStatus,
    })
    .from(reports)
    .where(and(...conditions))
    .orderBy(desc(reports.submittedAt))
    .limit(100)

  // 3. Ambil bukti foto utama secara batch guna mencegah multiplikasi baris dan duplikasi pin
  const thumbnailMap = new Map<string, string>()
  if (verifiedReports.length > 0) {
    const reportIds = verifiedReports.map((r) => r.id)
    const evidenceList = await db
      .select({
        reportId: reportEvidence.reportId,
        mediaUrl: reportEvidence.mediaUrl,
      })
      .from(reportEvidence)
      .where(inArray(reportEvidence.reportId, reportIds))

    for (const evidence of evidenceList) {
      if (!thumbnailMap.has(evidence.reportId)) {
        thumbnailMap.set(evidence.reportId, evidence.mediaUrl)
      }
    }
  }

  // 4. Samarkan koordinat presisi ke tingkat kelurahan (~800m) guna melindungi privasi (Rule 7)
  const mappedReports: Array<PublicMapReportItem> = verifiedReports.map((r) => {
    const masked = calculateMaskedCoordinates(r.id, r.latitude, r.longitude)

    return {
      id: r.id,
      trackingCode: r.trackingCode,
      incidentType: r.incidentType,
      description: r.description,
      observedAtIso: r.observedAt.toISOString(),
      submittedAtIso: r.submittedAt.toISOString(),
      latitude: masked.latitude,
      longitude: masked.longitude,
      addressDisplay: r.addressDisplay,
      handlingStatus: r.handlingStatus,
      thumbnailUrl: thumbnailMap.get(r.id) || null,
    }
  })

  // 4. Ambil data titik panas satelit NASA FIRMS
  const hotspots = await getOrSyncSatelliteHotspots(hours)

  // 5. Hitung metrik telemetri
  const totalInHandling = mappedReports.filter(
    (r) => r.handlingStatus === 'in_progress',
  ).length

  return {
    reports: mappedReports,
    hotspots,
    stats: {
      totalVerifiedReports: mappedReports.length,
      totalActiveHotspots: hotspots.length,
      totalInHandling,
      lastSyncedAtIso: new Date().toISOString(),
    },
  }
}
