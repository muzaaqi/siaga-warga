import { and, desc, eq, ilike, inArray, lt, or } from 'drizzle-orm'
import type { GetNewsFeedInput, NewsFeedResponse } from '@/lib/schema/news'
import { getNewsFeedInputSchema } from '@/lib/schema/news'
import { db } from '@/server/db'
import { user } from '@/server/db/schema/auth'
import { reportEvidence } from '@/server/db/schema/evidence'
import { reports } from '@/server/db/schema/reports'
import { calculateMaskedCoordinates } from '@/server/services/tracking'

/**
 * Mengambil feed kabar laporan publik yang terverifikasi dengan pencarian teks,
 * cursor pagination, dan proteksi privasi warga (Rule 7).
 */
export async function fetchPublicNewsFeed(
  rawInput: GetNewsFeedInput,
): Promise<NewsFeedResponse> {
  const input = getNewsFeedInputSchema.parse(rawInput)
  const limit = input.limit
  const conditions = []

  // Hanya laporan yang sudah diverifikasi resmi oleh posko / moderator
  conditions.push(eq(reports.verificationStatus, 'verified'))

  // Filter kategori insiden jika pengguna memilih selain 'all'
  if (input.incidentType !== 'all') {
    conditions.push(eq(reports.incidentType, input.incidentType))
  }

  // Filter pencarian teks dengan sanitasi wildcard SQL ILIKE (%, _, \)
  if (input.search && input.search.trim().length > 0) {
    const escapedTerm = input.search.trim().replace(/[%_\\]/g, '\\$&')
    const term = `%${escapedTerm}%`
    conditions.push(
      or(
        ilike(reports.description, term),
        ilike(reports.addressDisplay, term),
        ilike(reports.trackingCode, term),
      ),
    )
  }

  // Cursor pagination berbasis waktu kirim (submittedAt)
  if (input.cursor) {
    const cursorDate = new Date(input.cursor)
    if (!Number.isNaN(cursorDate.getTime())) {
      conditions.push(lt(reports.submittedAt, cursorDate))
    }
  }

  const queryConditions = conditions.length > 0 ? and(...conditions) : undefined

  // Ambil limit + 1 baris untuk mendeteksi hasMore secara akurat
  const rows = await db
    .select({
      id: reports.id,
      trackingCode: reports.trackingCode,
      incidentType: reports.incidentType,
      description: reports.description,
      submittedAt: reports.submittedAt,
      addressDisplay: reports.addressDisplay,
      verificationStatus: reports.verificationStatus,
      handlingStatus: reports.handlingStatus,
      latitude: reports.latitude,
      longitude: reports.longitude,
      isAnonymous: reports.isAnonymous,
      reporterId: user.id,
      reporterName: user.name,
      reporterImage: user.image,
      reporterRole: user.role,
      reportReporterName: reports.reporterName,
    })
    .from(reports)
    .leftJoin(user, eq(reports.reporterUserId, user.id))
    .where(queryConditions)
    .orderBy(desc(reports.submittedAt))
    .limit(limit + 1)

  const hasMore = rows.length > limit
  const slicedRows = hasMore ? rows.slice(0, limit) : rows

  // Ambil bukti foto utama untuk laporan yang dimuat
  const evidenceMap = new Map<string, string>()
  if (slicedRows.length > 0) {
    const reportIds = slicedRows.map((row) => row.id)
    const evidenceList = await db
      .select({
        reportId: reportEvidence.reportId,
        mediaUrl: reportEvidence.mediaUrl,
      })
      .from(reportEvidence)
      .where(inArray(reportEvidence.reportId, reportIds))

    for (const evidence of evidenceList) {
      if (!evidenceMap.has(evidence.reportId)) {
        evidenceMap.set(evidence.reportId, evidence.mediaUrl)
      }
    }
  }

  const items = slicedRows.map((row) => {
    // Samarkan koordinat secara deterministik (~800m) konsisten dengan /lacak dan /pantau (Rule 7)
    const masked = calculateMaskedCoordinates(row.id, row.latitude, row.longitude)

    return {
      id: row.id,
      trackingCode: row.trackingCode,
      incidentType: row.incidentType,
      description: row.description,
      submittedAtIso: row.submittedAt.toISOString(),
      addressDisplay: row.addressDisplay,
      verificationStatus: row.verificationStatus,
      handlingStatus: row.handlingStatus,
      latitude: masked.latitude,
      longitude: masked.longitude,
      primaryImageUrl: evidenceMap.get(row.id) ?? null,
      reporter: {
        id: row.isAnonymous ? null : (row.reporterId ?? null),
        name: row.isAnonymous
          ? 'Warga Siaga'
          : (row.reporterName || row.reportReporterName || 'Warga Siaga'),
        image: row.isAnonymous ? null : (row.reporterImage ?? null),
        role: row.isAnonymous ? 'citizen' : (row.reporterRole ?? 'citizen'),
      },
    }
  })

  const nextCursor =
    hasMore && slicedRows.length > 0
      ? slicedRows[slicedRows.length - 1].submittedAt.toISOString()
      : null

  return {
    items,
    nextCursor,
    hasMore,
  }
}
