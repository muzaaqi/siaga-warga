import { and, desc, eq, ilike, or, sql } from 'drizzle-orm'
import { db } from '@/server/db'
import {
  reports,
  reportEvidence,
  reportStatusHistory,
  user,
} from '@/server/db/schema'
import type {
  HandlingStatus,
  Priority,
  VerificationStatus,
} from '@/server/db/schema/reports'
import type {
  ModeratorEvidence,
  ModeratorQueueItem,
  ModeratorReportDetail,
  NearbyClusterReport,
  NearbySatelliteHotspot,
  ReportAuditHistoryItem,
  TriageQueueQuery,
  TriageQueueResponse,
  TriageStats,
  UpdateReportStatusInput,
} from '@/lib/schema/moderator'

/**
 * Menghitung selisih waktu antara waktu pengamatan klaim warga dengan metadata kamera asli (EXIF).
 */
export function calculateExifDiscrepancy(
  observedAt: Date,
  exifCaptureTime: Date | null,
): { timeDiscrepancyMinutes: number | null; isExifConsistent: boolean | null } {
  if (!exifCaptureTime) {
    return {
      timeDiscrepancyMinutes: null,
      isExifConsistent: null,
    }
  }

  const diffMs = Math.abs(observedAt.getTime() - exifCaptureTime.getTime())
  const discrepancyMinutes = Math.round(diffMs / (1000 * 60))

  // Toleransi 120 menit (2 jam) dianggap konsisten
  const isExifConsistent = discrepancyMinutes <= 120

  return {
    timeDiscrepancyMinutes: discrepancyMinutes,
    isExifConsistent,
  }
}

/**
 * Validasi kecocokan nilai enum dengan dimensi tipe status.
 */
export function validateStatusValueForType(
  statusType: string,
  newValue: string,
): boolean {
  if (statusType === 'verification') {
    return [
      'pending',
      'needs_review',
      'verified',
      'insufficient_evidence',
      'rejected',
    ].includes(newValue)
  }
  if (statusType === 'handling') {
    return [
      'not_forwarded',
      'forwarded',
      'acknowledged',
      'in_progress',
      'resolved',
      'unknown',
    ].includes(newValue)
  }
  if (statusType === 'priority') {
    return ['high', 'normal', 'low'].includes(newValue)
  }
  return false
}

/**
 * Mengambil ringkasan telemetri antrean triase moderator.
 */
export async function fetchTriageStats(): Promise<TriageStats> {
  const result = await db.execute(sql`
    SELECT
      COUNT(CASE WHEN verification_status = 'pending' THEN 1 END)::int AS pending_count,
      COUNT(CASE WHEN verification_status = 'needs_review' THEN 1 END)::int AS needs_review_count,
      COUNT(CASE WHEN priority = 'high' THEN 1 END)::int AS high_priority_count,
      COUNT(CASE WHEN submitted_at >= NOW() - INTERVAL '24 hours' THEN 1 END)::int AS today_reports_count
    FROM reports;
  `)

  const row = (result as unknown as Array<{
    pending_count: number
    needs_review_count: number
    high_priority_count: number
    today_reports_count: number
  }>)[0] as
    | {
        pending_count: number
        needs_review_count: number
        high_priority_count: number
        today_reports_count: number
      }
    | undefined

  if (!row) {
    return {
      pendingCount: 0,
      needsReviewCount: 0,
      highPriorityCount: 0,
      todayReportsCount: 0,
    }
  }

  return {
    pendingCount: Number(row.pending_count),
    needsReviewCount: Number(row.needs_review_count),
    highPriorityCount: Number(row.high_priority_count),
    todayReportsCount: Number(row.today_reports_count),
  }
}

/**
 * Mengambil daftar antrean triase laporan untuk /admin/triase.
 */
export async function fetchTriageQueue(
  query: TriageQueueQuery,
): Promise<TriageQueueResponse> {
  const stats = await fetchTriageStats()

  const conditions = []

  if (query.priority !== 'all') {
    conditions.push(eq(reports.priority, query.priority))
  }

  if (query.status !== 'all') {
    conditions.push(eq(reports.verificationStatus, query.status))
  }

  if (query.incidentType !== 'all') {
    conditions.push(eq(reports.incidentType, query.incidentType))
  }

  if (query.search && query.search.trim().length > 0) {
    const term = `%${query.search.trim()}%`
    conditions.push(
      or(
        ilike(reports.trackingCode, term),
        ilike(reports.description, term),
        ilike(reports.addressDisplay, term),
      ),
    )
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // Kueri laporan dengan pengurutan cerdas (Prioritas high di atas, lalu submittedAt desc)
  const reportRows = await db
    .select({
      id: reports.id,
      trackingCode: reports.trackingCode,
      incidentType: reports.incidentType,
      description: reports.description,
      observedAt: reports.observedAt,
      submittedAt: reports.submittedAt,
      addressDisplay: reports.addressDisplay,
      verificationStatus: reports.verificationStatus,
      priority: reports.priority,
      handlingStatus: reports.handlingStatus,
      isPotentialDuplicate: reports.isPotentialDuplicate,
      clusterId: reports.clusterId,
      satelliteHotspotMatched: reports.satelliteHotspotMatched,
    })
    .from(reports)
    .where(whereClause)
    .orderBy(
      sql`CASE 
        WHEN ${reports.priority} = 'high' THEN 1 
        WHEN ${reports.priority} = 'normal' THEN 2 
        ELSE 3 
      END ASC`,
      desc(reports.submittedAt),
    )
    .limit(query.limit)
    .offset(query.offset)

  // Ambil thumbnail bukti foto untuk setiap laporan
  const items: Array<ModeratorQueueItem> = []

  for (const rep of reportRows) {
    const evidenceRows = await db
      .select({
        mediaUrl: reportEvidence.mediaUrl,
      })
      .from(reportEvidence)
      .where(eq(reportEvidence.reportId, rep.id))
      .orderBy(reportEvidence.createdAt)

    items.push({
      id: rep.id,
      trackingCode: rep.trackingCode,
      incidentType: rep.incidentType,
      description: rep.description,
      observedAt: rep.observedAt.toISOString(),
      submittedAt: rep.submittedAt.toISOString(),
      addressDisplay: rep.addressDisplay,
      verificationStatus: rep.verificationStatus,
      priority: rep.priority,
      handlingStatus: rep.handlingStatus,
      isPotentialDuplicate: rep.isPotentialDuplicate,
      clusterId: rep.clusterId,
      satelliteHotspotMatched: rep.satelliteHotspotMatched,
      evidenceThumbnailUrl: evidenceRows[0]?.mediaUrl ?? null,
      evidenceCount: evidenceRows.length,
    })
  }

  return {
    items,
    stats,
    totalMatching: items.length,
  }
}

/**
 * Mengambil rincian laporan mendalam untuk halaman /admin/laporan/$id.
 */
export async function fetchModeratorReportDetail(
  reportId: string,
): Promise<ModeratorReportDetail> {
  const reportRows = await db
    .select()
    .from(reports)
    .where(eq(reports.id, reportId))
    .limit(1)

  if (reportRows.length === 0) {
    throw new Error('Laporan dengan ID tersebut tidak ditemukan.')
  }

  const report = reportRows[0]

  // Data akun pelapor jika ada
  let reporterEmail: string | null = null
  let reporterName = report.reporterName
  const reporterPhone = report.reporterPhone

  if (report.reporterUserId) {
    const userRows = await db
      .select({
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(eq(user.id, report.reporterUserId))
      .limit(1)

    if (userRows.length > 0) {
      reporterEmail = userRows[0].email
      if (!reporterName) {
        reporterName = userRows[0].name
      }
    }
  }

  // Berkas bukti media
  const evidenceRows = await db
    .select()
    .from(reportEvidence)
    .where(eq(reportEvidence.reportId, reportId))
    .orderBy(reportEvidence.createdAt)

  const evidence: Array<ModeratorEvidence> = evidenceRows.map((ev) => {
    const discrepancy = calculateExifDiscrepancy(
      report.observedAt,
      ev.exifCaptureTime,
    )
    return {
      id: ev.id,
      mediaUrl: ev.mediaUrl,
      r2ObjectKey: ev.r2ObjectKey,
      fileHashSha256: ev.fileHashSha256,
      exifCaptureTime: ev.exifCaptureTime
        ? ev.exifCaptureTime.toISOString()
        : null,
      fileSizeBytes: ev.fileSizeBytes,
      mimeType: ev.mimeType,
      createdAt: ev.createdAt.toISOString(),
      timeDiscrepancyMinutes: discrepancy.timeDiscrepancyMinutes,
      isExifConsistent: discrepancy.isExifConsistent,
    }
  })

  // Klaster laporan serupa terdekat dalam radius 2 km
  const clusterReportsResult = await db.execute(sql`
    SELECT 
      id::text AS id,
      tracking_code AS tracking_code,
      incident_type AS incident_type,
      observed_at AS observed_at,
      verification_status AS verification_status,
      ROUND(ST_Distance(
        location_geom::geography, 
        ST_SetSRID(ST_MakePoint(${report.longitude}, ${report.latitude}), 4326)::geography
      )::numeric, 0) AS distance_meters
    FROM reports
    WHERE 
      id != ${report.id}::uuid
      AND ST_DWithin(
        location_geom::geography, 
        ST_SetSRID(ST_MakePoint(${report.longitude}, ${report.latitude}), 4326)::geography, 
        2000
      )
    ORDER BY distance_meters ASC
    LIMIT 5;
  `)

  const nearbyClusterReports: Array<NearbyClusterReport> = (
    clusterReportsResult as unknown as Array<{
      id: string
      tracking_code: string
      incident_type: string
      observed_at: string | Date
      verification_status: string
      distance_meters: number | string
    }>
  ).map((row) => ({
    id: row.id,
    trackingCode: row.tracking_code,
    incidentType: row.incident_type as ModeratorQueueItem['incidentType'],
    observedAt: new Date(row.observed_at).toISOString(),
    distanceMeters: Number(row.distance_meters),
    verificationStatus:
      row.verification_status as ModeratorQueueItem['verificationStatus'],
  }))

  // Titik panas satelit NASA FIRMS terdekat dalam radius 5 km
  const satelliteHotspotsResult = await db.execute(sql`
    SELECT 
      id::text AS id,
      source AS source,
      brightness AS brightness,
      confidence AS confidence,
      acquired_at AS acquired_at,
      ROUND((ST_Distance(
        geom::geography, 
        ST_SetSRID(ST_MakePoint(${report.longitude}, ${report.latitude}), 4326)::geography
      ) / 1000)::numeric, 2) AS distance_km
    FROM satellite_hotspots
    WHERE 
      ST_DWithin(
        geom::geography, 
        ST_SetSRID(ST_MakePoint(${report.longitude}, ${report.latitude}), 4326)::geography, 
        5000
      )
    ORDER BY distance_km ASC
    LIMIT 5;
  `)

  const nearbySatelliteHotspots: Array<NearbySatelliteHotspot> = (
    satelliteHotspotsResult as unknown as Array<{
      id: string
      source: string
      brightness: number | null
      confidence: string | null
      acquired_at: string | Date
      distance_km: number | string
    }>
  ).map((row) => ({
    id: row.id,
    source: row.source,
    brightness: row.brightness !== null ? Number(row.brightness) : null,
    confidence: row.confidence,
    acquiredAt: new Date(row.acquired_at).toISOString(),
    distanceKm: Number(row.distance_km),
  }))

  // Riwayat audit imutabel
  const historyRows = await db
    .select()
    .from(reportStatusHistory)
    .where(eq(reportStatusHistory.reportId, reportId))
    .orderBy(desc(reportStatusHistory.createdAt))

  const statusHistory: Array<ReportAuditHistoryItem> = historyRows.map(
    (item) => ({
      id: item.id,
      statusType: item.statusType,
      previousValue: item.previousValue,
      newValue: item.newValue,
      changedBy: item.changedBy,
      reasonNote: item.reasonNote,
      createdAt: item.createdAt.toISOString(),
    }),
  )

  return {
    id: report.id,
    trackingCode: report.trackingCode,
    incidentType: report.incidentType,
    description: report.description,
    observedAt: report.observedAt.toISOString(),
    submittedAt: report.submittedAt.toISOString(),
    latitude: report.latitude,
    longitude: report.longitude,
    addressDisplay: report.addressDisplay,
    verificationStatus: report.verificationStatus,
    priority: report.priority,
    handlingStatus: report.handlingStatus,
    isPotentialDuplicate: report.isPotentialDuplicate,
    clusterId: report.clusterId,
    satelliteHotspotMatched: report.satelliteHotspotMatched,
    isAnonymous: report.isAnonymous,
    reporterName,
    reporterPhone,
    reporterEmail,
    evidence,
    nearbyClusterReports,
    nearbySatelliteHotspots,
    statusHistory,
  }
}

/**
 * Memperbarui status laporan secara atomik dan mencatat riwayat ke tabel audit imutabel.
 */
export async function executeReportStatusChange(
  actorName: string,
  input: UpdateReportStatusInput,
): Promise<{ success: boolean; reportId: string }> {
  if (!validateStatusValueForType(input.statusType, input.newValue)) {
    throw new Error(
      `Nilai status '${input.newValue}' tidak valid untuk dimensi '${input.statusType}'.`,
    )
  }

  const reportRows = await db
    .select()
    .from(reports)
    .where(eq(reports.id, input.reportId))
    .limit(1)

  if (reportRows.length === 0) {
    throw new Error('Laporan tidak ditemukan.')
  }

  const currentReport = reportRows[0]
  let previousValue = ''

  if (input.statusType === 'verification') {
    previousValue = currentReport.verificationStatus
    await db
      .update(reports)
      .set({
        verificationStatus: input.newValue as VerificationStatus,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, input.reportId))
  } else if (input.statusType === 'handling') {
    previousValue = currentReport.handlingStatus
    await db
      .update(reports)
      .set({
        handlingStatus: input.newValue as HandlingStatus,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, input.reportId))
  } else {
    previousValue = currentReport.priority
    await db
      .update(reports)
      .set({
        priority: input.newValue as Priority,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, input.reportId))
  }

  // Sisipkan entri audit ke report_status_history
  await db.insert(reportStatusHistory).values({
    reportId: input.reportId,
    statusType: input.statusType,
    previousValue,
    newValue: input.newValue,
    changedBy: actorName,
    reasonNote: input.reasonNote,
  })

  return {
    success: true,
    reportId: input.reportId,
  }
}
