/**
 * Standar HTTP Security Headers SiagaWarga.
 * Memproteksi antarmuka dari clickjacking (X-Frame-Options),
 * eksploitasi MIME sniffing (X-Content-Type-Options), kebocoran referrer,
 * dan mengizinkan fitur kamera belakang & geolokasi warga (Permissions-Policy).
 */
export const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(self), geolocation=(self), microphone=()',
}

/**
 * Menyuntikkan seluruh header keamanan ke objek Headers peramban / respons.
 */
export function applySecurityHeaders(headers: Headers): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value)
  }
}
