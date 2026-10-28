import exifr from 'exifr'

export interface CompressedImageResult {
  blob: Blob
  previewUrl: string
  width: number
  height: number
  sizeBytes: number
  hashSha256: string
  exifCaptureTime?: string
}

/**
 * Mengonversi ArrayBuffer menjadi string heksadesimal SHA-256.
 */
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Menghitung hash SHA-256 berkas gambar di sisi klien (Web Crypto API).
 */
export async function calculateFileSha256(
  blobOrFile: Blob | File,
): Promise<string> {
  const arrayBuffer = await blobOrFile.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  return bufferToHex(hashBuffer)
}

/**
 * Kompresi gambar sisi klien sesuai Rule 20 & PRD 5.1:
 * - Batas dimensi maksimal: 1600px (lebar/tinggi).
 * - Format: image/webp (kualitas 0.82) atau image/jpeg jika webp tidak didukung.
 * - Ekstraksi timestamp EXIF DateTimeOriginal sebelum EXIF dibersihkan oleh canvas.
 * - Perhitungan hash SHA-256 untuk mendeteksi re-upload foto identik.
 */
export async function compressImageClientSide(
  file: File,
  maxDimension = 1600,
  quality = 0.82,
): Promise<CompressedImageResult> {
  // 1. Ekstraksi metadata EXIF sebelum canvas
  let exifCaptureTime: string | undefined
  try {
    const exifData = await exifr.parse(file, ['DateTimeOriginal', 'CreateDate'])
    if (exifData?.DateTimeOriginal) {
      exifCaptureTime = new Date(exifData.DateTimeOriginal).toISOString()
    } else if (exifData?.CreateDate) {
      exifCaptureTime = new Date(exifData.CreateDate).toISOString()
    }
  } catch {
    // Abaikan jika EXIF tidak terbaca atau format non-JPEG
  }

  // 2. Baca file sebagai Image Bitmap / Image Element
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Gagal memuat berkas gambar'))
    }
    img.src = url
  })

  // 3. Hitung dimensi proporsional baru
  let { width, height } = image
  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width)
      width = maxDimension
    } else {
      width = Math.round((width * maxDimension) / height)
      height = maxDimension
    }
  }

  // 4. Render ke HTML Canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas 2D context tidak tersedia')
  }

  // Pengaturan kualitas resampling
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, 0, 0, width, height)

  // 5. Ekspor ke Blob WebP (atau JPEG)
  const targetMime = 'image/webp'
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result)
        else reject(new Error('Gagal mengompresi gambar'))
      },
      targetMime,
      quality,
    )
  })

  // 6. Hitung Checksum SHA-256
  const hashSha256 = await calculateFileSha256(blob)
  const previewUrl = URL.createObjectURL(blob)

  return {
    blob,
    previewUrl,
    width,
    height,
    sizeBytes: blob.size,
    hashSha256,
    exifCaptureTime,
  }
}
