import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { getUploadUrlInputSchema } from '@/lib/schema/evidence'
import type {
  GetUploadUrlInput,
  GetUploadUrlOutput,
} from '@/lib/schema/evidence'
import { generateR2PresignedPutUrl } from '@/server/services/r2'
import { checkRateLimit, extractClientIp } from '@/server/services/rate-limit'

/**
 * Logika pembuatan Presigned PUT URL untuk unggah berkas langsung ke Cloudflare R2 (Rule 3).
 * Mencegah buffering berkas berukuran besar di Cloudflare Workers.
 */
export async function createUploadUrlLogic(
  input: GetUploadUrlInput,
  clientIp: string = '127.0.0.1',
): Promise<GetUploadUrlOutput> {
  const rateLimit = checkRateLimit(clientIp, 'evidence_upload')
  if (!rateLimit.allowed) {
    throw new Error(
      `RATE_LIMIT_EXCEEDED: Batas pembuatan tiket unggah tercapai. Silakan coba lagi dalam ${rateLimit.retryAfterSeconds} detik.`,
    )
  }

  const fileExtension = input.filename.split('.').pop() || 'webp'
  const sanitizedExt = fileExtension.toLowerCase().replace(/[^a-z0-9]/g, '')
  const randomId = crypto.randomUUID()
  const objectKey = `evidence/${randomId}.${sanitizedExt}`

  const result = await generateR2PresignedPutUrl({
    key: objectKey,
    mimeType: input.mimeType,
    expiresInSeconds: 900, // 15 menit
  })

  return {
    uploadUrl: result.uploadUrl,
    r2ObjectKey: result.r2ObjectKey,
    publicUrl: result.publicUrl,
  }
}

/**
 * Server Function penerbitan URL unggah R2 presigned.
 * Dipanggil oleh PhotoUploadZone di browser sebelum mengunggah foto.
 */
export const getPresignedUploadUrl = createServerFn({ method: 'POST' })
  .validator((data: unknown) => getUploadUrlInputSchema.parse(data))
  .handler(async ({ data }) => {
    let clientIp = '127.0.0.1'
    try {
      const req = getRequest()
      clientIp = extractClientIp(req)
    } catch {
      // Fallback aman jika dipanggil di luar konteks request (misal: pengujian unit)
    }

    return createUploadUrlLogic(data, clientIp)
  })
