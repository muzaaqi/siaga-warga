import { db } from './index'
import {
  reports,
  reportEvidence,
  satelliteHotspots,
  reportStatusHistory,
} from './schema'

/**
 * Script seeder database untuk pengujian lokal, demo, dan evaluasi juri WIA 2026.
 * Menyediakan data sampel karhutla (Riau, Kalbar) dan kebakaran permukiman (Jakarta, Surabaya).
 */
async function seed() {
  console.log('Menjalankan seeding data awal SiagaWarga...')

  try {
    // 1. Data Sampel Laporan (Reports)
    const sampleReports = [
      {
        trackingCode: 'SW-2026-A101',
        incidentType: 'karhutla' as const,
        description:
          'Kepulan asap pekat dan api merambat cepat di lahan gambut dekat perkebunan kelapa sawit.',
        observedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 jam lalu
        latitude: 0.5333,
        longitude: 101.45,
        addressDisplay: 'Kec. Rumbai, Kota Pekanbaru, Riau',
        verificationStatus: 'verified' as const,
        priority: 'high' as const,
        handlingStatus: 'in_progress' as const,
        isPotentialDuplicate: false,
        satelliteHotspotMatched: true,
        reporterName: 'Budi Santoso',
        reporterPhone: '081234567890',
        isAnonymous: false,
      },
      {
        trackingCode: 'SW-2026-B202',
        incidentType: 'karhutla' as const,
        description:
          'Titik api kecil terlihat di semak belukar pinggir jalan poros, potensi meluas karena angin kencang.',
        observedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 jam lalu
        latitude: -0.0263,
        longitude: 109.3425,
        addressDisplay: 'Kec. Sungai Raya, Kab. Kubu Raya, Kalimantan Barat',
        verificationStatus: 'verified' as const,
        priority: 'normal' as const,
        handlingStatus: 'acknowledged' as const,
        isPotentialDuplicate: false,
        satelliteHotspotMatched: true,
        reporterName: 'Warga Setempat',
        reporterPhone: null,
        isAnonymous: true,
      },
      {
        trackingCode: 'SW-2026-C303',
        incidentType: 'permukiman' as const,
        description:
          'Kebakaran melanda rumah petak padat penduduk, kobaran api terlihat di lantai dua bangunan.',
        observedAt: new Date(Date.now() - 45 * 60 * 1000), // 45 menit lalu
        latitude: -6.1751,
        longitude: 106.8272,
        addressDisplay: 'Kec. Gambir, Kota Jakarta Pusat, DKI Jakarta',
        verificationStatus: 'verified' as const,
        priority: 'high' as const,
        handlingStatus: 'in_progress' as const,
        isPotentialDuplicate: false,
        satelliteHotspotMatched: false,
        reporterName: 'Siti Rahma',
        reporterPhone: '085712345678',
        isAnonymous: false,
      },
      {
        trackingCode: 'SW-2026-D404',
        incidentType: 'permukiman' as const,
        description:
          'Percikan korsleting listrik memicu asap tebal di ruko toko kelontong.',
        observedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 menit lalu
        latitude: -7.2575,
        longitude: 112.7521,
        addressDisplay: 'Kec. Genteng, Kota Surabaya, Jawa Timur',
        verificationStatus: 'pending' as const,
        priority: 'normal' as const,
        handlingStatus: 'not_forwarded' as const,
        isPotentialDuplicate: false,
        satelliteHotspotMatched: false,
        reporterName: 'Ahmad Fauzi',
        reporterPhone: '087812345678',
        isAnonymous: false,
      },
      {
        trackingCode: 'SW-2026-E505',
        incidentType: 'karhutla' as const,
        description:
          'Kebakaran semak belukar di lereng bukit, sudah ditangani oleh regu pemadam kebakaran desa.',
        observedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 jam lalu
        latitude: -2.2136,
        longitude: 113.9108,
        addressDisplay:
          'Kec. Jekan Raya, Kota Palangka Raya, Kalimantan Tengah',
        verificationStatus: 'verified' as const,
        priority: 'low' as const,
        handlingStatus: 'resolved' as const,
        isPotentialDuplicate: false,
        satelliteHotspotMatched: true,
        reporterName: 'Relawan Api',
        reporterPhone: null,
        isAnonymous: true,
      },
    ]

    const insertedReports = await db
      .insert(reports)
      .values(sampleReports)
      .returning()
    console.log(
      `Berhasil menambahkan ${insertedReports.length} laporan contoh.`,
    )

    // 2. Data Sampel Bukti Foto (Report Evidence)
    const sampleEvidence = insertedReports.map((report, idx) => ({
      reportId: report.id,
      r2ObjectKey: `evidence/sample-fire-${idx + 1}.webp`,
      mediaUrl: `https://pub-r2.siagawarga.id/evidence/sample-fire-${idx + 1}.webp`,
      fileHashSha256: `samplehash${idx + 1}${'0'.repeat(52)}`,
      exifCaptureTime: report.observedAt,
      fileSizeBytes: 750000 + idx * 50000,
      mimeType: 'image/webp',
    }))

    await db.insert(reportEvidence).values(sampleEvidence)
    console.log(
      `Berhasil menambahkan ${sampleEvidence.length} bukti foto contoh.`,
    )

    // 3. Data Sampel Hotspot Satelit (NASA FIRMS)
    const sampleHotspots = [
      {
        source: 'VIIRS_SNPP',
        latitude: 0.5345,
        longitude: 101.452,
        brightness: 345.8,
        confidence: 'high',
        acquiredAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        source: 'MODIS',
        latitude: -0.0275,
        longitude: 109.345,
        brightness: 320.5,
        confidence: 'nominal',
        acquiredAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        source: 'VIIRS_SNPP',
        latitude: -2.215,
        longitude: 113.912,
        brightness: 360.2,
        confidence: 'high',
        acquiredAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
      },
    ]

    await db.insert(satelliteHotspots).values(sampleHotspots)
    console.log(
      `Berhasil menambahkan ${sampleHotspots.length} titik api satelit NASA FIRMS.`,
    )

    // 4. Data Sampel Jejak Audit Moderator (Report Status History)
    const sampleAuditLogs = [
      {
        reportId: insertedReports[0].id,
        statusType: 'verification',
        previousValue: 'pending',
        newValue: 'verified',
        changedBy: 'MOD-01 (Dinas Damkar Riau)',
        reasonNote:
          'Foto menunjukkan kobaran api aktif pada koordinat sesuai dengan citra satelit VIIRS.',
      },
      {
        reportId: insertedReports[0].id,
        statusType: 'handling',
        previousValue: 'not_forwarded',
        newValue: 'in_progress',
        changedBy: 'MOD-01 (Dinas Damkar Riau)',
        reasonNote:
          'Unit Manggala Agni Daops Pekanbaru telah diberangkatkan ke lokasi.',
      },
      {
        reportId: insertedReports[4].id,
        statusType: 'handling',
        previousValue: 'in_progress',
        newValue: 'resolved',
        changedBy: 'MOD-02 (BPBD Kalteng)',
        reasonNote:
          'Api telah padam sepenuhnya, pendinginan lahan gambut telah selesai.',
      },
    ]

    await db.insert(reportStatusHistory).values(sampleAuditLogs)
    console.log(
      `Berhasil menambahkan ${sampleAuditLogs.length} riwayat jejak audit status.`,
    )

    console.log('Seeding SiagaWarga selesai dengan sukses!')
  } catch (error) {
    console.error('Terjadi kesalahan saat menjalankan seeder:', error)
    process.exit(1)
  }
}

seed()
