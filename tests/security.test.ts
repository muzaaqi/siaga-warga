import { describe, expect, it, beforeEach } from 'bun:test'
import {
  SECURITY_HEADERS,
  applySecurityHeaders,
} from '@/server/services/security-headers'
import {
  checkRateLimit,
  extractClientIp,
  resetRateLimitsForTesting,
  RATE_LIMIT_CONFIGS,
} from '@/server/services/rate-limit'

describe('Plan 06: Security Headers & Rate Limiting Hardening', () => {
  beforeEach(() => {
    resetRateLimitsForTesting()
  })

  describe('1. HTTP Security Headers Specification', () => {
    it('harus memuat header anti-clickjacking dan proteksi peramban wajib', () => {
      expect(SECURITY_HEADERS['X-Frame-Options']).toBe('DENY')
      expect(SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff')
      expect(SECURITY_HEADERS['Referrer-Policy']).toBe(
        'strict-origin-when-cross-origin',
      )
    })

    it('harus mengonfigurasi Permissions-Policy dengan izin kamera belakang & GPS serta menonaktifkan mikrofon', () => {
      const permissionsPolicy = SECURITY_HEADERS['Permissions-Policy']
      expect(permissionsPolicy).toBeDefined()
      expect(permissionsPolicy).toContain('camera=(self)')
      expect(permissionsPolicy).toContain('geolocation=(self)')
      expect(permissionsPolicy).toContain('microphone=()')
    })

    it('harus menyuntikkan seluruh header keamanan ke objek Headers respons', () => {
      const headers = new Headers()
      applySecurityHeaders(headers)

      expect(headers.get('X-Frame-Options')).toBe('DENY')
      expect(headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(headers.get('Referrer-Policy')).toBe(
        'strict-origin-when-cross-origin',
      )
      expect(headers.get('Permissions-Policy')).toContain('camera=(self)')
    })
  })

  describe('2. Client IP Extraction Logic', () => {
    it('harus memprioritaskan header cf-connecting-ip dari Cloudflare Edge', () => {
      const req = new Request('https://siagawarga.id/api', {
        headers: {
          'cf-connecting-ip': '114.124.200.1',
          'x-real-ip': '10.0.0.1',
          'x-forwarded-for': '192.168.1.1',
        },
      })
      expect(extractClientIp(req)).toBe('114.124.200.1')
    })

    it('harus membaca x-real-ip jika cf-connecting-ip tidak tersedia', () => {
      const req = new Request('https://siagawarga.id/api', {
        headers: {
          'x-real-ip': '180.252.10.5',
          'x-forwarded-for': '192.168.1.1',
        },
      })
      expect(extractClientIp(req)).toBe('180.252.10.5')
    })

    it('harus mengambil IP pertama pada daftar x-forwarded-for', () => {
      const req = new Request('https://siagawarga.id/api', {
        headers: {
          'x-forwarded-for': '36.85.12.9, 10.0.0.1, 172.16.0.1',
        },
      })
      expect(extractClientIp(req)).toBe('36.85.12.9')
    })

    it('harus mengembalikan fallback 127.0.0.1 jika header IP tidak ada atau objek request kosong', () => {
      expect(extractClientIp(null)).toBe('127.0.0.1')
      expect(extractClientIp(new Request('https://siagawarga.id/api'))).toBe(
        '127.0.0.1',
      )
    })
  })

  describe('3. In-Memory Sliding Window Rate Limiting', () => {
    it('harus mengizinkan pengiriman laporan dalam batas kuota yang ditentukan', () => {
      const ip = '202.152.1.1'
      const maxReports = RATE_LIMIT_CONFIGS.report_submission.maxRequests

      for (let i = 0; i < maxReports; i++) {
        const result = checkRateLimit(ip, 'report_submission')
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(maxReports - (i + 1))
      }
    })

    it('harus menolak pengiriman laporan saat kuota terlampaui dan memberikan sisa waktu tunggu', () => {
      const ip = '202.152.1.2'
      const maxReports = RATE_LIMIT_CONFIGS.report_submission.maxRequests
      const now = Date.now()

      for (let i = 0; i < maxReports; i++) {
        checkRateLimit(ip, 'report_submission', now)
      }

      // Permintaan ke-(N+1) harus ditolak
      const blocked = checkRateLimit(ip, 'report_submission', now + 1000)
      expect(blocked.allowed).toBe(false)
      expect(blocked.remaining).toBe(0)
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0)
    })

    it('harus mengisolasi kuota antar alamat IP yang berbeda', () => {
      const ipA = '103.10.1.1'
      const ipB = '103.10.1.2'
      const maxReports = RATE_LIMIT_CONFIGS.report_submission.maxRequests

      // Habiskan kuota IP A
      for (let i = 0; i < maxReports; i++) {
        checkRateLimit(ipA, 'report_submission')
      }
      expect(checkRateLimit(ipA, 'report_submission').allowed).toBe(false)

      // IP B tetap memiliki kuota penuh
      const resultB = checkRateLimit(ipB, 'report_submission')
      expect(resultB.allowed).toBe(true)
      expect(resultB.remaining).toBe(maxReports - 1)
    })

    it('harus mengizinkan permintaan kembali setelah jendela waktu kadaluwarsa', () => {
      const ip = '103.20.1.1'
      const maxUploads = RATE_LIMIT_CONFIGS.evidence_upload.maxRequests
      const windowMs = RATE_LIMIT_CONFIGS.evidence_upload.windowMs
      const t0 = 1000000

      // Habiskan kuota pada waktu t0
      for (let i = 0; i < maxUploads; i++) {
        checkRateLimit(ip, 'evidence_upload', t0)
      }
      expect(checkRateLimit(ip, 'evidence_upload', t0).allowed).toBe(false)

      // Setelah jendela waktu berlalu (t0 + windowMs + 1), harus diizinkan kembali
      const afterWindow = t0 + windowMs + 1000
      const refreshed = checkRateLimit(ip, 'evidence_upload', afterWindow)
      expect(refreshed.allowed).toBe(true)
    })
  })
})
