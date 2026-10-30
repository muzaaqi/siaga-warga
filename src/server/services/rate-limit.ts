import type { RateLimitAction, RateLimitResult } from '@/lib/schema/rate-limit'

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

export const RATE_LIMIT_CONFIGS: Record<RateLimitAction, RateLimitConfig> = {
  evidence_upload: {
    windowMs: 10 * 60 * 1000, // 10 menit
    maxRequests: 10, // Maks 10 unggahan per IP per 10 menit
  },
  report_submission: {
    windowMs: 10 * 60 * 1000, // 10 menit
    maxRequests: 5, // Maks 5 laporan baru per IP per 10 menit
  },
}

// Penyimpanan stempel waktu sliding window dalam memori (IP-isolated)
const rateLimitStore = new Map<string, number[]>()

/**
 * Mengekstrak alamat IP klien dari header HTTP peramban.
 * Mendukung Cloudflare (cf-connecting-ip), proxy (x-forwarded-for), dan fallback aman.
 */
export function extractClientIp(request?: Request | null): string {
  if (!request) {
    return '127.0.0.1'
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp && cfConnectingIp.trim().length > 0) {
    return cfConnectingIp.trim()
  }

  const xRealIp = request.headers.get('x-real-ip')
  if (xRealIp && xRealIp.trim().length > 0) {
    return xRealIp.trim()
  }

  const xForwardedFor = request.headers.get('x-forwarded-for')
  if (xForwardedFor && xForwardedFor.trim().length > 0) {
    // Ambil IP pertama jika berupa daftar dipisahkan koma
    const firstIp = xForwardedFor.split(',')[0]?.trim()
    if (firstIp && firstIp.length > 0) {
      return firstIp
    }
  }

  return '127.0.0.1'
}

/**
 * Memeriksa kuota permintaan berdasarkan aksi dan alamat IP klien.
 * Menggunakan algoritma sliding-window berbasis stempel waktu.
 */
export function checkRateLimit(
  ip: string,
  action: RateLimitAction,
  nowEpochMs: number = Date.now(),
): RateLimitResult {
  const config = RATE_LIMIT_CONFIGS[action]
  const key = `${action}:${ip}`
  const windowStart = nowEpochMs - config.windowMs

  // Ambil data stempel waktu sebelumnya dan buang yang sudah melewati jendela waktu
  const existingTimestamps = rateLimitStore.get(key) || []
  const validTimestamps = existingTimestamps.filter((ts) => ts > windowStart)

  if (validTimestamps.length >= config.maxRequests) {
    // Cari stempel waktu tertua yang masih aktif untuk menghitung waktu tunggu sisa
    const oldestTimestamp = validTimestamps[0] || windowStart
    const resetAtEpochMs = oldestTimestamp + config.windowMs
    const retryAfterMs = Math.max(0, resetAtEpochMs - nowEpochMs)
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000)

    // Perbarui stempel waktu yang valid agar tidak membengkak
    rateLimitStore.set(key, validTimestamps)

    return {
      allowed: false,
      limit: config.maxRequests,
      remaining: 0,
      resetAtEpochMs,
      retryAfterSeconds,
    }
  }

  // Tambahkan stempel waktu saat ini
  validTimestamps.push(nowEpochMs)
  rateLimitStore.set(key, validTimestamps)

  // Pembersihan berkala jika memori terlalu besar (> 1000 entri)
  if (rateLimitStore.size > 1000) {
    for (const [storeKey, timestamps] of rateLimitStore.entries()) {
      const activeTimestamps = timestamps.filter((ts) => ts > windowStart)
      if (activeTimestamps.length === 0) {
        rateLimitStore.delete(storeKey)
      } else {
        rateLimitStore.set(storeKey, activeTimestamps)
      }
    }
  }

  const remaining = config.maxRequests - validTimestamps.length
  const oldestTimestamp = validTimestamps[0] || nowEpochMs
  const resetAtEpochMs = oldestTimestamp + config.windowMs

  return {
    allowed: true,
    limit: config.maxRequests,
    remaining,
    resetAtEpochMs,
    retryAfterSeconds: 0,
  }
}

/**
 * Utilitas untuk membersihkan memori rate limit (khusus untuk pengujian otomatis)
 */
export function resetRateLimitsForTesting(): void {
  rateLimitStore.clear()
}
