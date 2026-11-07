import type { EmergencyDispatchPayload } from './schema/share'
import { formatFullDateTime } from './utils'

export const incidentTypeShareLabels: Record<string, string> = {
  karhutla: 'Kebakaran Hutan & Lahan (Karhutla)',
  permukiman: 'Kebakaran Permukiman Warga',
  industri: 'Kebakaran Pabrik / Kawasan Industri',
  lainnya: 'Kebakaran Lainnya',
}

export const verificationStatusShareLabels: Record<string, string> = {
  verified: 'Terverifikasi Sah',
  pending: 'Menunggu Verifikasi Lapangan',
  needs_review: 'Uji Silang Lapangan',
  insufficient_evidence: 'Bukti Kurang Memadai',
  rejected: 'Laporan Ditolak / Tidak Terbukti',
}

export const handlingStatusShareLabels: Record<string, string> = {
  not_forwarded: 'Belum Diteruskan ke Instansi',
  forwarded: 'Diteruskan ke Damkar / BPBD',
  acknowledged: 'Dikonfirmasi oleh Petugas',
  in_progress: 'Operasi Pemadaman Lapangan',
  resolved: 'Selesai / Teratasi',
  unknown: 'Status Penanganan Belum Diketahui',
}

/**
 * Menghasilkan naskah siaran darurat WhatsApp resmi yang terstruktur,
 * mematuhi kebijakan ZERO EMOJI (Rule 14), dan melindungi privasi warga (Rule 7).
 */
export function generateEmergencyDispatchText(
  payload: EmergencyDispatchPayload,
): string {
  const incidentLabel =
    incidentTypeShareLabels[payload.incidentType] || payload.incidentType
  const verificationLabel =
    verificationStatusShareLabels[payload.verificationStatus] ||
    payload.verificationStatus
  const handlingLabel =
    handlingStatusShareLabels[payload.handlingStatus] || payload.handlingStatus

  const timeString = formatFullDateTime(
    payload.observedAtIso || payload.submittedAtIso,
  )
  const locationString = payload.addressDisplay
    ? payload.addressDisplay.trim()
    : 'Titik koordinat terverifikasi lapangan'

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${payload.latitude},${payload.longitude}`
  const trackingUrl = `https://siagawarga.id/lacak/${payload.trackingCode}`

  // Format baku laporan darurat tanpa emoji
  return `[LAPORAN DARURAT KEBAKARAN - SIAGAWARGA]

*Kode Lacak:* ${payload.trackingCode}
*Jenis Kejadian:* ${incidentLabel}
*Status Verifikasi:* ${verificationLabel}
*Status Penanganan:* ${handlingLabel}
*Waktu Kejadian:* ${timeString}
*Lokasi:* ${locationString}

*Keterangan Lapangan:*
"${payload.description.trim()}"

*Navigasi Lokasi (Google Maps):*
${googleMapsUrl}

*Pantau Perkembangan Langsung:*
${trackingUrl}

_Laporan warga terverifikasi melalui Platform SiagaWarga. Hubungi Layanan Darurat: 112 / 113_`
}

/**
 * Menghasilkan URL protokol WhatsApp (api.whatsapp.com/send) dengan teks yang
 * ter-encode secara sempurna dan aman.
 */
export function generateWhatsAppShareUrl(
  text: string,
  phoneNumber?: string,
): string {
  const encodedText = encodeURIComponent(text)

  if (phoneNumber && phoneNumber.trim().length > 0) {
    let cleanedPhone = phoneNumber.replace(/\D/g, '')

    // Normalisasi format nomor lokal Indonesia: 08xx -> 628xx
    if (cleanedPhone.startsWith('0')) {
      cleanedPhone = `62${cleanedPhone.slice(1)}`
    }

    // Hanya sertakan parameter phone jika panjang nomor valid (minimal 8 digit)
    if (cleanedPhone.length >= 8) {
      return `https://api.whatsapp.com/send?phone=${cleanedPhone}&text=${encodedText}`
    }
  }

  return `https://api.whatsapp.com/send?text=${encodedText}`
}

/**
 * Menyalin teks ke clipboard peramban dengan penanganan kesalahan yang aman.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
