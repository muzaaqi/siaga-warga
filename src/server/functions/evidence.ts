import { createServerFn } from '@tanstack/react-start'
import { getUploadUrlInputSchema } from '@/lib/schema/evidence'
import type {
  GetUploadUrlInput,
  GetUploadUrlOutput,
} from '@/lib/schema/evidence'
import { generateR2PresignedPutUrl } from '@/server/services/r2'

/**
 * Logika pembuatan Presigned PUT URL untuk unggah berkas langsung ke Cloudflare R2 (Rule 3).
 * Mencegah buffering berkas berukuran besar di Cloudflare Workers.
 */
async function createUploadUrlLogic(
  input: GetUploadUrlInput,
): Promise<GetUploadUrlOutput> {
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
    return createUploadUrlLogic(data)
  })
