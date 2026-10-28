import { getServerEnv } from '@/server/env'

export interface GeneratePresignedPutUrlParams {
  key: string
  mimeType: string
  expiresInSeconds?: number
}

export interface PresignedPutUrlResult {
  uploadUrl: string
  r2ObjectKey: string
  publicUrl?: string
}

/**
 * Konversi ArrayBuffer menjadi hex string secara efisien menggunakan Web Crypto.
 */
function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Menghitung HMAC-SHA256 menggunakan Web Crypto API (Web Standard - Rule 17).
 */
async function hmacSha256(
  key: Uint8Array | ArrayBuffer,
  message: string,
): Promise<ArrayBuffer> {
  const keyBuffer = key instanceof Uint8Array ? key : new Uint8Array(key)
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer as unknown as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    new TextEncoder().encode(message),
  )
}

/**
 * Menghitung SHA-256 hash dari string menggunakan Web Crypto API.
 */
async function sha256(message: string): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(message),
  )
  return toHex(hashBuffer)
}

/**
 * Membuat AWS Signature v4 Presigned PUT URL untuk Cloudflare R2.
 * Kompatibel 100% dengan Cloudflare Workers (workerd) dan Bun runtime (Rule 17).
 */
export async function generateR2PresignedPutUrl(
  params: GeneratePresignedPutUrlParams,
): Promise<PresignedPutUrlResult> {
  const { key, mimeType, expiresInSeconds = 900 } = params

  const env = getServerEnv(process.env)
  const accountId = env.R2_ACCOUNT_ID
  const accessKeyId = env.R2_ACCESS_KEY_ID
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY
  const bucketName = env.R2_BUCKET_NAME
  const publicBaseUrl = env.R2_PUBLIC_URL

  // Fallback untuk lingkungan pengujian atau dev lokal jika kredensial R2 belum disetel
  if (!accountId || !accessKeyId || !secretAccessKey) {
    const mockUploadUrl = `http://localhost:3000/api/mock-upload?key=${encodeURIComponent(key)}`
    return {
      uploadUrl: mockUploadUrl,
      r2ObjectKey: key,
      publicUrl: publicBaseUrl ? `${publicBaseUrl}/${key}` : undefined,
    }
  }

  const host = `${accountId}.r2.cloudflarestorage.com`
  const region = 'auto'
  const service = 's3'

  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.substring(0, 8)

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`

  // Buat query string standar AWS SigV4
  const queryParams = new URLSearchParams({
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${accessKeyId}/${credentialScope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': expiresInSeconds.toString(),
    'X-Amz-SignedHeaders': 'content-type;host',
  })

  queryParams.sort()
  const canonicalQueryString = queryParams.toString()

  // Canonical Request
  const canonicalUri = `/${bucketName}/${key}`
  const canonicalHeaders = `content-type:${mimeType}\nhost:${host}\n`
  const signedHeaders = 'content-type;host'
  const payloadHash = 'UNSIGNED-PAYLOAD'

  const canonicalRequest = [
    'PUT',
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')

  const canonicalRequestHash = await sha256(canonicalRequest)

  // String to Sign
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    canonicalRequestHash,
  ].join('\n')

  // Signature calculation: kDate -> kRegion -> kService -> kSigning
  const kSecret = new TextEncoder().encode(`AWS4${secretAccessKey}`)
  const kDate = await hmacSha256(kSecret, dateStamp)
  const kRegion = await hmacSha256(kDate, region)
  const kService = await hmacSha256(kRegion, service)
  const kSigning = await hmacSha256(kService, 'aws4_request')
  const signatureBuffer = await hmacSha256(kSigning, stringToSign)
  const signature = toHex(signatureBuffer)

  const uploadUrl = `https://${host}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`

  return {
    uploadUrl,
    r2ObjectKey: key,
    publicUrl: publicBaseUrl ? `${publicBaseUrl}/${key}` : undefined,
  }
}
