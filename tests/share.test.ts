import { describe, expect, it } from 'bun:test'
import {
  emergencyDispatchPayloadSchema,
  type EmergencyDispatchPayload,
} from '@/lib/schema/share'
import {
  generateEmergencyDispatchText,
  generateWhatsAppShareUrl,
  incidentTypeShareLabels,
  verificationStatusShareLabels,
  handlingStatusShareLabels,
} from '@/lib/share'

describe('Emergency WhatsApp Dispatcher (Plan 12)', () => {
  const validPayload: EmergencyDispatchPayload = {
    trackingCode: 'SW-2026-X89B',
    incidentType: 'karhutla',
    verificationStatus: 'verified',
    handlingStatus: 'in_progress',
    observedAtIso: '2026-11-06T14:30:00.000Z',
    submittedAtIso: '2026-11-06T14:35:00.000Z',
    addressDisplay: 'Jl. Raya Pelalawan Km 12, Pangkalan Kerinci',
    latitude: -0.3214,
    longitude: 101.8923,
    description:
      'Asap tebal membubung tinggi di dekat kebun sawit warga, arah angin menuju pemukiman.',
    reporterName: 'Budi Santoso',
  }

  describe('Zod Isomorphic Schemas', () => {
    it('harus memvalidasi payload laporan yang sah dengan semua atribut lengkap', () => {
      const parsed = emergencyDispatchPayloadSchema.safeParse(validPayload)
      expect(parsed.success).toBe(true)
    })

    it('harus menolak format kode pelacakan yang tidak sesuai pola resmi', () => {
      const invalid = { ...validPayload, trackingCode: 'INVALID-CODE' }
      const parsed = emergencyDispatchPayloadSchema.safeParse(invalid)
      expect(parsed.success).toBe(false)
    })

    it('harus menolak koordinat di luar wilayah batas kedaulatan Indonesia', () => {
      // Latitude di luar batas Indonesia (misal: kutub utara 80)
      const invalidLat = { ...validPayload, latitude: 80.0 }
      expect(emergencyDispatchPayloadSchema.safeParse(invalidLat).success).toBe(
        false,
      )

      // Longitude di luar batas Indonesia (misal: New York -74)
      const invalidLon = { ...validPayload, longitude: -74.0 }
      expect(emergencyDispatchPayloadSchema.safeParse(invalidLon).success).toBe(
        false,
      )
    })

    it('harus menerima addressDisplay null atau tidak diisi', () => {
      const withNullAddress = { ...validPayload, addressDisplay: null }
      expect(
        emergencyDispatchPayloadSchema.safeParse(withNullAddress).success,
      ).toBe(true)

      const withoutAddress = { ...validPayload, addressDisplay: undefined }
      expect(
        emergencyDispatchPayloadSchema.safeParse(withoutAddress).success,
      ).toBe(true)
    })

    it('harus menolak deskripsi kosong', () => {
      const emptyDesc = { ...validPayload, description: '' }
      expect(emergencyDispatchPayloadSchema.safeParse(emptyDesc).success).toBe(
        false,
      )
    })
  })

  describe('Pemformatan Naskah Darurat WhatsApp (Rule 14 & Sistem Kejujuran)', () => {
    it('harus menghasilkan judul pembuka resmi dan kode lacak yang tepat', () => {
      const text = generateEmergencyDispatchText(validPayload)
      expect(text).toContain('[LAPORAN DARURAT KEBAKARAN - SIAGAWARGA]')
      expect(text).toContain('*Kode Lacak:* SW-2026-X89B')
    })

    it('harus memetakan label status verifikasi dan penanganan dengan bahasa Indonesia yang baku', () => {
      const text = generateEmergencyDispatchText(validPayload)
      expect(text).toContain(
        `*Jenis Kejadian:* ${incidentTypeShareLabels.karhutla}`,
      )
      expect(text).toContain(
        `*Status Verifikasi:* ${verificationStatusShareLabels.verified}`,
      )
      expect(text).toContain(
        `*Status Penanganan:* ${handlingStatusShareLabels.in_progress}`,
      )
    })

    it('harus memuat koordinat Google Maps dan tautan resmi pemantauan SiagaWarga', () => {
      const text = generateEmergencyDispatchText(validPayload)
      expect(text).toContain(
        'https://www.google.com/maps/search/?api=1&query=-0.3214,101.8923',
      )
      expect(text).toContain('https://siagawarga.id/lacak/SW-2026-X89B')
    })

    it('harus menangani alamat null dengan teks cadangan informatif', () => {
      const payloadNoAddress: EmergencyDispatchPayload = {
        ...validPayload,
        addressDisplay: null,
      }
      const text = generateEmergencyDispatchText(payloadNoAddress)
      expect(text).toContain('*Lokasi:* Titik koordinat terverifikasi lapangan')
    })

    it('harus menyertakan catatan saksi berbingkai tanda petik dan nomor darurat 112 / 113', () => {
      const text = generateEmergencyDispatchText(validPayload)
      expect(text).toContain(
        '"Asap tebal membubung tinggi di dekat kebun sawit warga, arah angin menuju pemukiman."',
      )
      expect(text).toContain('112 / 113')
    })

    it('harus memenuhi kebijakan ZERO EMOJI secara mutlak (Rule 14)', () => {
      const text = generateEmergencyDispatchText(validPayload)
      // Pola regex komprehensif pendeteksi karakter emoji Unicode
      const emojiRegex =
        /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g
      const matches = text.match(emojiRegex)
      expect(matches).toBeNull()
    })

    it('tidak boleh membocorkan data pribadi reporter (telepon/email)', () => {
      const text = generateEmergencyDispatchText(validPayload)
      expect(text).not.toContain('@')
      expect(text).not.toContain('081')
      expect(text).not.toContain('+62')
    })
  })

  describe('Pembangkit Tautan WhatsApp (URL Generator)', () => {
    it('harus menghasilkan URL pengiriman WhatsApp dengan query text ter-encode secara valid', () => {
      const sampleText = 'Halo [TEST] SW-2026-X89B\nBaris kedua & ketiga'
      const url = generateWhatsAppShareUrl(sampleText)

      expect(url.startsWith('https://api.whatsapp.com/send?text=')).toBe(true)
      expect(url).toContain(encodeURIComponent(sampleText))
      expect(url).not.toContain(' ')
      expect(url).not.toContain('\n')
    })

    it('harus mendukung penambahan nomor telepon tujuan jika disediakan', () => {
      const sampleText = 'Laporan Darurat'
      const url = generateWhatsAppShareUrl(sampleText, '628123456789')

      expect(url).toContain('phone=628123456789')
      expect(url).toContain('text=' + encodeURIComponent(sampleText))
    })
  })
})
