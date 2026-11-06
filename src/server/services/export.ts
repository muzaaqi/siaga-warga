import { and, desc, eq, gte } from 'drizzle-orm'
import { db } from '@/server/db'
import { reports } from '@/server/db/schema/reports'
import { reportEvidence } from '@/server/db/schema/evidence'
import type {
  ExportDataResponse,
  ExportReportRow,
  ExportReportsQuery,
  ExportTimeRange,
} from '@/lib/schema/export'

/**
 * Sanitasi nilai sel untuk format CSV sesuai standar RFC 4180.
 * Mencegah CSV injection dan kerusakan parsing akibat koma, petik ganda, atau newline.
 */
export function escapeCsvValue(
  value: string | number | boolean | null | undefined,
): string {
  if (value === null || value === undefined) {
    return ''
  }

  const str = String(value)
  if (
    str.includes(',') ||
    str.includes('"') ||
    str.includes('\n') ||
    str.includes('\r')
  ) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

/**
 * Menghitung batas waktu minimal laporan berdasarkan filter rentang waktu.
 */
export function calculateExportTimeBoundary(
  timeRange: ExportTimeRange,
  referenceNow: Date = new Date(),
): Date | null {
  if (timeRange === '24h') {
    return new Date(referenceNow.getTime() - 24 * 60 * 60 * 1000)
  }
  if (timeRange === '7d') {
    return new Date(referenceNow.getTime() - 7 * 24 * 60 * 60 * 1000)
  }
  if (timeRange === '30d') {
    return new Date(referenceNow.getTime() - 30 * 24 * 60 * 60 * 1000)
  }
  return null
}

/**
 * Memformat daftar rekaman insiden menjadi string berkas CSV terstruktur (RFC 4180).
 */
export function generateReportsCsv(rows: Array<ExportReportRow>): string {
  const headers = [
    'kode_lacak',
    'jenis_insiden',
    'deskripsi',
    'waktu_pengamatan',
    'waktu_lapor',
    'latitude',
    'longitude',
    'alamat',
    'status_verifikasi',
    'prioritas',
    'status_penanganan',
    'korelasi_satelit',
    'klaster_duplikat',
    'nama_pelapor',
    'telepon_pelapor',
    'tautan_bukti_foto',
  ]

  const dataLines = rows.map((row) => {
    const reporterName = row.isAnonymous
      ? 'Warga Anonim'
      : row.reporterName || ''
    const reporterPhone = row.isAnonymous ? '' : row.reporterPhone || ''
    const observedAtStr = new Date(row.observedAt).toISOString()
    const submittedAtStr = new Date(row.submittedAt).toISOString()

    const values = [
      escapeCsvValue(row.trackingCode),
      escapeCsvValue(row.incidentType),
      escapeCsvValue(row.description),
      escapeCsvValue(observedAtStr),
      escapeCsvValue(submittedAtStr),
      escapeCsvValue(row.latitude),
      escapeCsvValue(row.longitude),
      escapeCsvValue(row.addressDisplay),
      escapeCsvValue(row.verificationStatus),
      escapeCsvValue(row.priority),
      escapeCsvValue(row.handlingStatus),
      escapeCsvValue(row.satelliteHotspotMatched ? 'true' : 'false'),
      escapeCsvValue(row.isPotentialDuplicate ? 'true' : 'false'),
      escapeCsvValue(reporterName),
      escapeCsvValue(reporterPhone),
      escapeCsvValue(row.evidenceMediaUrl),
    ]

    return values.join(',')
  })

  return [headers.join(','), ...dataLines].join('\r\n')
}

/**
 * Memformat daftar rekaman insiden menjadi string dokumen GeoJSON spasial (RFC 7946).
 */
export function generateReportsGeoJson(rows: Array<ExportReportRow>): string {
  const features = rows.map((row) => {
    const reporterName = row.isAnonymous
      ? 'Warga Anonim'
      : row.reporterName || null
    const reporterPhone = row.isAnonymous ? null : row.reporterPhone || null

    return {
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [row.longitude, row.latitude],
      },
      properties: {
        trackingCode: row.trackingCode,
        incidentType: row.incidentType,
        description: row.description,
        observedAt: new Date(row.observedAt).toISOString(),
        submittedAt: new Date(row.submittedAt).toISOString(),
        address: row.addressDisplay,
        verificationStatus: row.verificationStatus,
        priority: row.priority,
        handlingStatus: row.handlingStatus,
        satelliteHotspotMatched: row.satelliteHotspotMatched,
        isPotentialDuplicate: row.isPotentialDuplicate,
        reporterName,
        reporterPhone,
        evidenceUrl: row.evidenceMediaUrl,
      },
    }
  })

  const geoJsonObject = {
    type: 'FeatureCollection',
    features,
  }

  return JSON.stringify(geoJsonObject, null, 2)
}

/**
 * Mengambil data laporan insiden dari basis data dan memformatnya sesuai pilihan (CSV / GeoJSON).
 */
export async function fetchExportData(
  query: ExportReportsQuery,
): Promise<ExportDataResponse> {
  const conditions = []

  // Filter status verifikasi
  if (query.verificationStatus !== 'all') {
    conditions.push(eq(reports.verificationStatus, query.verificationStatus))
  }

  // Filter jenis insiden
  if (query.incidentType !== 'all') {
    conditions.push(eq(reports.incidentType, query.incidentType))
  }

  // Filter rentang waktu
  const timeBoundary = calculateExportTimeBoundary(query.timeRange)
  if (timeBoundary) {
    conditions.push(gte(reports.submittedAt, timeBoundary))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // Kueri laporan dari database
  const matchedReports = await db
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
      verificationStatus: reports.verificationStatus,
      priority: reports.priority,
      handlingStatus: reports.handlingStatus,
      satelliteHotspotMatched: reports.satelliteHotspotMatched,
      isPotentialDuplicate: reports.isPotentialDuplicate,
      reporterName: reports.reporterName,
      reporterPhone: reports.reporterPhone,
      isAnonymous: reports.isAnonymous,
    })
    .from(reports)
    .where(whereClause)
    .orderBy(desc(reports.submittedAt))
    .limit(query.limit)

  // Ambil bukti foto untuk setiap laporan
  const rows: Array<ExportReportRow> = await Promise.all(
    matchedReports.map(async (rep) => {
      const evidence = await db
        .select({ mediaUrl: reportEvidence.mediaUrl })
        .from(reportEvidence)
        .where(eq(reportEvidence.reportId, rep.id))
        .limit(1)

      return {
        ...rep,
        satelliteHotspotMatched: Boolean(rep.satelliteHotspotMatched),
        isPotentialDuplicate: Boolean(rep.isPotentialDuplicate),
        isAnonymous: Boolean(rep.isAnonymous),
        evidenceMediaUrl: evidence[0]?.mediaUrl ?? null,
      }
    }),
  )

  const dateStr = new Date().toISOString().slice(0, 10)
  const isGeoJson = query.format === 'geojson'

  const filename = isGeoJson
    ? `siagawarga-insiden-${dateStr}.geojson`
    : `siagawarga-insiden-${dateStr}.csv`

  const mimeType = isGeoJson
    ? 'application/geo+json; charset=utf-8'
    : 'text/csv; charset=utf-8'

  const content = isGeoJson
    ? generateReportsGeoJson(rows)
    : generateReportsCsv(rows)

  return {
    filename,
    mimeType,
    content,
    totalRows: rows.length,
  }
}
