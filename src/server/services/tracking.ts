import { eq, desc } from 'drizzle-orm'
import { db } from '@/server/db'
import { reports, reportEvidence, reportStatusHistory } from '@/server/db/schema'
import type {
  ReportTrackingDetail,
  TrackingTimelinePhase,
  TrackingAuditEntry,
  TrackingEvidence,
} from '@/lib/schema/tracking'

/**
 * Menghasilkan koordinat tersamar deterministik (~300m s/d 800m) berdasarkan ID laporan.
 * Mencegah kebocoran koordinat presisi rumah warga ke publik (Rule 7).
 */
export function calculateMaskedCoordinates(
  reportId: string,
  lat: number,
  lon: number,
): { latitude: number; longitude: number; approximateRadiusMeters: number } {
  let hash = 0
  for (let i = 0; i < reportId.length; i++) {
    hash = (hash << 5) - hash + reportId.charCodeAt(i)
    hash |= 0
  }

  // Base offset ~0.003 derajat (~330m) untuk menjamin ada pergeseran
  const baseOffsetLat = 0.003
  const baseOffsetLon = 0.003
  const dynamicOffsetLat = (Math.abs(hash) % 40) / 10000 // 0 s/d 0.0040
  const dynamicOffsetLon = (Math.abs(hash >> 8) % 40) / 10000

  const signLat = hash % 2 === 0 ? 1 : -1
  const signLon = (hash >> 4) % 2 === 0 ? 1 : -1

  const latOffset = (baseOffsetLat + dynamicOffsetLat) * signLat
  const lonOffset = (baseOffsetLon + dynamicOffsetLon) * signLon

  return {
    latitude: Number((lat + latOffset).toFixed(5)),
    longitude: Number((lon + lonOffset).toFixed(5)),
    approximateRadiusMeters: 800,
  }
}

/**
 * Mengkalkulasi status dan narasi pada 4-Phase Stepper.
 */
export function buildTrackingPhases(report: {
  submittedAt: Date
  observedAt: Date
  verificationStatus: string
  handlingStatus: string
  isPotentialDuplicate: boolean
  satelliteHotspotMatched: boolean
  auditHistory: Array<{
    statusType: string
    newValue: string
    createdAt: Date
    reasonNote: string
  }>
}): Array<TrackingTimelinePhase> {
  const submittedAtIso = report.submittedAt.toISOString()

  // 1. Fase 1: Laporan Diterima (Selalu selesai jika record ada di basis data)
  const phase1: TrackingTimelinePhase = {
    phaseIndex: 1,
    phaseKey: 'received',
    title: 'Laporan Diterima',
    description:
      'Laporan dan foto bukti berhasil diunggah dan terdaftar di basis data SiagaWarga.',
    status: 'completed',
    timestampIso: submittedAtIso,
    badgeLabel: 'Diterima',
  }

  // 2. Fase 2: Analisis Spasial & Satelit (Deduplikasi PostGIS & NASA FIRMS)
  let phase2Desc =
    'Selesai dianalisis secara spasial; tidak ada laporan ganda terdeteksi di area sekitar.'
  let phase2Badge = 'Analisis Mandiri'

  if (report.isPotentialDuplicate) {
    phase2Desc =
      'Terpetakan dalam radius 2 km dari klaster kebakaran aktif warga sekitar.'
    phase2Badge = 'Klaster Sekitar'
  } else if (report.satelliteHotspotMatched) {
    phase2Desc =
      'Terindikasi selaras dengan anomali titik panas satelit NASA FIRMS.'
    phase2Badge = 'Satelit Cocok'
  }

  const phase2: TrackingTimelinePhase = {
    phaseIndex: 2,
    phaseKey: 'analyzed',
    title: 'Analisis Spasial & Satelit',
    description: phase2Desc,
    status: 'completed',
    timestampIso: submittedAtIso,
    badgeLabel: phase2Badge,
  }

  // 3. Fase 3: Verifikasi Lapangan (Human-in-the-Loop)
  const verificationAudit = report.auditHistory.find(
    (a) => a.statusType === 'verification',
  )
  const verificationTimeIso = verificationAudit
    ? verificationAudit.createdAt.toISOString()
    : report.verificationStatus === 'verified'
      ? submittedAtIso
      : null

  let phase3Status: TrackingTimelinePhase['status'] = 'in_progress'
  let phase3Badge = 'Menunggu Verifikasi'
  let phase3Desc =
    'Menunggu peninjauan keabsahan bukti foto oleh verifikator lapangan.'

  switch (report.verificationStatus) {
    case 'needs_review':
      phase3Status = 'in_progress'
      phase3Badge = 'Uji Silang Lapangan'
      phase3Desc =
        'Petugas memerlukan verifikasi data tambahan di lapangan untuk memastikan situasi.'
      break
    case 'verified':
      phase3Status = 'completed'
      phase3Badge = 'Terverifikasi Sah'
      phase3Desc =
        'Laporan dan bukti foto dinyatakan sah dan valid oleh verifikator.'
      break
    case 'insufficient_evidence':
      phase3Status = 'rejected'
      phase3Badge = 'Bukti Tidak Memadai'
      phase3Desc =
        'Foto bukti buram atau tidak memperlihatkan indikasi kebakaran nyata.'
      break
    case 'rejected':
      phase3Status = 'rejected'
      phase3Badge = 'Ditolak'
      phase3Desc =
        'Laporan ditolak oleh petugas verifikasi karena tidak memenuhi kriteria darurat.'
      break
    case 'pending':
    default:
      phase3Status = 'in_progress'
      phase3Badge = 'Menunggu Verifikasi'
      phase3Desc =
        'Menunggu peninjauan keabsahan bukti foto oleh verifikator.'
      break
  }

  const phase3: TrackingTimelinePhase = {
    phaseIndex: 3,
    phaseKey: 'verified',
    title: 'Verifikasi Lapangan',
    description: phase3Desc,
    status: phase3Status,
    timestampIso: verificationTimeIso,
    badgeLabel: phase3Badge,
    note: verificationAudit ? verificationAudit.reasonNote : undefined,
  }

  // 4. Fase 4: Tindak Lanjut Instansi (Damkar / BPBD)
  const handlingAudit = report.auditHistory.find(
    (a) => a.statusType === 'handling',
  )
  const handlingTimeIso = handlingAudit
    ? handlingAudit.createdAt.toISOString()
    : null

  let phase4Status: TrackingTimelinePhase['status'] = 'pending'
  let phase4Badge = 'Belum Diteruskan'
  let phase4Desc =
    'Laporan berada dalam antrean sebelum diteruskan ke instansi penanganan.'

  switch (report.handlingStatus) {
    case 'forwarded':
      phase4Status = 'in_progress'
      phase4Badge = 'Diteruskan ke Damkar/BPBD'
      phase4Desc =
        'Informasi telah diteruskan ke instansi pemadam kebakaran dan BPBD wilayah setempat.'
      break
    case 'acknowledged':
      phase4Status = 'in_progress'
      phase4Badge = 'Terkonfirmasi Instansi'
      phase4Desc =
        'Posko siaga bencana telah menerima dan mengonfirmasi kesiapan penanganan.'
      break
    case 'in_progress':
      phase4Status = 'in_progress'
      phase4Badge = 'Operasi Pemadaman'
      phase4Desc =
        'Regu pemadam berada di lokasi dan operasi pemadaman sedang berlangsung.'
      break
    case 'resolved':
      phase4Status = 'completed'
      phase4Badge = 'Selesai / Teratasi'
      phase4Desc =
        'Titik api telah berhasil dipadamkan dan lokasi dinyatakan aman.'
      break
    case 'unknown':
      phase4Status = 'pending'
      phase4Badge = 'Status Belum Diketahui'
      phase4Desc = 'Status penanganan belum dapat dipastikan saat ini.'
      break
    case 'not_forwarded':
    default:
      phase4Status = 'pending'
      phase4Badge = 'Belum Diteruskan'
      phase4Desc =
        'Laporan berada dalam antrean sebelum diteruskan ke instansi penanganan.'
      break
  }

  const phase4: TrackingTimelinePhase = {
    phaseIndex: 4,
    phaseKey: 'handling',
    title: 'Tindak Lanjut Instansi',
    description: phase4Desc,
    status: phase4Status,
    timestampIso: handlingTimeIso,
    badgeLabel: phase4Badge,
    note: handlingAudit ? handlingAudit.reasonNote : undefined,
  }

  return [phase1, phase2, phase3, phase4]
}

/**
 * Mengambil detail laporan lengkap dan linimasa audit berdasarkan kode pelacakan.
 * Menegakkan Rule 7 (Zero PII leakage) & Rule 8 (Immutable audit log).
 */
export async function fetchReportByTrackingCode(
  rawCode: string,
): Promise<ReportTrackingDetail | null> {
  const normalizedCode = rawCode.trim().toUpperCase()

  // 1. Ambil data utama laporan
  const foundReports = await db
    .select()
    .from(reports)
    .where(eq(reports.trackingCode, normalizedCode))
    .limit(1)

  if (foundReports.length === 0) {
    return null
  }

  const report = foundReports[0]

  // 2. Ambil bukti foto terkait
  const evidenceRecords = await db
    .select()
    .from(reportEvidence)
    .where(eq(reportEvidence.reportId, report.id))
    .limit(1)

  let sanitizedEvidence: TrackingEvidence | null = null
  if (evidenceRecords.length > 0) {
    const rawEv = evidenceRecords[0]
    sanitizedEvidence = {
      id: rawEv.id,
      mediaUrl: rawEv.mediaUrl,
      mimeType: rawEv.mimeType,
      fileSizeBytes: rawEv.fileSizeBytes,
      fileHashSha256: rawEv.fileHashSha256,
      exifCaptureTimeIso: rawEv.exifCaptureTime
        ? rawEv.exifCaptureTime.toISOString()
        : null,
    }
  }

  // 3. Ambil riwayat audit imutabel
  const auditRecords = await db
    .select()
    .from(reportStatusHistory)
    .where(eq(reportStatusHistory.reportId, report.id))
    .orderBy(desc(reportStatusHistory.createdAt))

  const sanitizedAuditHistory: Array<TrackingAuditEntry> = auditRecords.map(
    (entry) => {
      // Rule 7: Samarkan identitas akun internal moderator dari publik
      const isSystem =
        entry.changedBy.toLowerCase().includes('system') ||
        entry.changedBy.toLowerCase().includes('sistem')
      const sanitizedActor = isSystem ? 'Sistem' : 'Petugas Verifikasi'

      return {
        id: entry.id,
        statusType: entry.statusType as 'verification' | 'handling' | 'priority',
        previousValue: entry.previousValue,
        newValue: entry.newValue,
        changedBy: sanitizedActor,
        reasonNote: entry.reasonNote,
        createdAtIso: entry.createdAt.toISOString(),
      }
    },
  )

  // 4. Hitung koordinat tersamar deterministik (Rule 7)
  const maskedLocation = calculateMaskedCoordinates(
    report.id,
    report.latitude,
    report.longitude,
  )

  // 5. Susun linimasa 4 fase
  const phases = buildTrackingPhases({
    submittedAt: report.submittedAt,
    observedAt: report.observedAt,
    verificationStatus: report.verificationStatus,
    handlingStatus: report.handlingStatus,
    isPotentialDuplicate: Boolean(report.isPotentialDuplicate),
    satelliteHotspotMatched: Boolean(report.satelliteHotspotMatched),
    auditHistory: auditRecords.map((a) => ({
      statusType: a.statusType,
      newValue: a.newValue,
      createdAt: a.createdAt,
      reasonNote: a.reasonNote,
    })),
  })

  // 6. Return response bebas PII
  return {
    id: report.id,
    trackingCode: report.trackingCode,
    incidentType: report.incidentType,
    description: report.description,
    observedAtIso: report.observedAt.toISOString(),
    submittedAtIso: report.submittedAt.toISOString(),
    addressDisplay: report.addressDisplay,
    maskedLocation,
    verificationStatus: report.verificationStatus,
    priority: report.priority,
    handlingStatus: report.handlingStatus,
    clusterId: report.clusterId,
    isPotentialDuplicate: Boolean(report.isPotentialDuplicate),
    satelliteHotspotMatched: Boolean(report.satelliteHotspotMatched),
    evidence: sanitizedEvidence,
    phases,
    auditHistory: sanitizedAuditHistory,
  }
}
