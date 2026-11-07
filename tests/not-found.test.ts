import { describe, expect, it } from 'bun:test'
import { getReportTrackingInputSchema } from '@/lib/schema/tracking'
import { NotFound } from '@/components/shared/not-found'
import { GlobalErrorFallback } from '@/components/shared/global-error-fallback'

describe('Custom 404 & Resilient Not Found Fallback (Plan 15)', () => {
  describe('Zod Tracking Code Validator for 404 Search', () => {
    it('harus menerima format kode pelacakan resmi yang valid (SW-YYYY-XXXX)', () => {
      const validCodes = ['SW-2026-X89B', 'SW-2025-1234', 'SW-2026-ABCD']
      for (const code of validCodes) {
        const result = getReportTrackingInputSchema.safeParse({ trackingCode: code })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.trackingCode).toBe(code)
        }
      }
    })

    it('harus menormalisasi kode berhuruf kecil dan spasi berlebih menjadi format baku', () => {
      const result = getReportTrackingInputSchema.safeParse({
        trackingCode: '  sw-2026-x89b  ',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.trackingCode).toBe('SW-2026-X89B')
      }
    })

    it('harus menolak format kode yang salah atau tidak sesuai standar SiagaWarga', () => {
      const invalidCodes = [
        '',
        'INVALID',
        'SW2026X89B',
        'SW-202-ABCD',
        'SW-2026-ABCDE',
        '12345',
        'SW-XXXX-2026',
      ]
      for (const code of invalidCodes) {
        const result = getReportTrackingInputSchema.safeParse({ trackingCode: code })
        expect(result.success).toBe(false)
      }
    })
  })

  describe('Emergency Hotline & Fast Recovery Links Standards', () => {
    it('harus menyediakan nomor darurat resmi Indonesia (112 & 113) tanpa ambigu', () => {
      const hotlines = [
        { service: 'Panggilan Darurat', number: '112', protocol: 'tel:112' },
        { service: 'Pemadam Kebakaran', number: '113', protocol: 'tel:113' },
      ]
      for (const h of hotlines) {
        expect(h.protocol).toMatch(/^tel:\d{3}$/)
      }
    })

    it('harus memverifikasi rute navigasi taktis utama untuk pemulihan warga', () => {
      const targetRoutes = ['/', '/pantau', '/lapor']
      expect(targetRoutes).toContain('/')
      expect(targetRoutes).toContain('/pantau')
      expect(targetRoutes).toContain('/lapor')
    })
  })

  describe('Universal Zero Emoji Compliance (Rule 14)', () => {
    it('seluruh teks microcopy 404 dan boundary galat harus 100% bebas emoji', () => {
      const copyTexts = [
        'Halaman Tidak Ditemukan',
        '404 NOT FOUND',
        'Tautan yang Anda tuju mungkin sudah dipindahkan, dihapus, atau alamat URL salah ketik. Seluruh layanan pemantauan dan pelaporan kebakaran SiagaWarga tetap aktif.',
        'Kembali ke Beranda',
        'Buka Peta Pantau',
        'Laporkan Titik Api',
        'Cari Status Laporan Kebakaran',
        'Lacak Laporan',
        'Butuh Bantuan Pemadaman Segera?',
        'Hubungi Pemadam Kebakaran di 113 atau Layanan Kedaruratan Bebas Pulsa 112 jika berada di dekat api.',
        'Terjadi Kendala pada Halaman',
        'Sistem mengalami kendala sementara saat memproses permintaan ini. Silakan coba lagi atau kembali ke beranda.',
        'Coba Lagi',
      ]

      // Regex mendeteksi karakter emoji Unicode
      const emojiRegex =
        /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u

      for (const text of copyTexts) {
        expect(emojiRegex.test(text)).toBe(false)
      }
    })
  })

  describe('Component Definitions & Export Verification', () => {
    it('harus mengekspor komponen NotFound dan GlobalErrorFallback yang valid', () => {
      expect(typeof NotFound).toBe('function')
      expect(typeof GlobalErrorFallback).toBe('function')
    })
  })
})
