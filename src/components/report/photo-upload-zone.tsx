import * as React from 'react'
import {
  AlertTriangleIcon,
  CameraIcon,
  CheckCircle2Icon,
  FileImageIcon,
  RefreshCwIcon,
  Trash2Icon,
  UploadCloudIcon,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { compressImageClientSide } from '@/lib/image-compression'
import type { CompressedImageResult } from '@/lib/image-compression'
import { getPresignedUploadUrl } from '@/server/functions/evidence'
import { cn } from '@/lib/utils'

export interface UploadedPhotoData {
  r2ObjectKey: string
  fileHashSha256: string
  exifCaptureTime?: string
  previewUrl: string
  fileName: string
  fileSizeBytes: number
}

interface PhotoUploadZoneProps {
  onPhotoUploaded: (data: UploadedPhotoData) => void
  onPhotoRemoved: () => void
  disabled?: boolean
  error?: string
}

export function PhotoUploadZone({
  onPhotoUploaded,
  onPhotoRemoved,
  disabled = false,
  error,
}: PhotoUploadZoneProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [state, setState] = React.useState<
    'idle' | 'compressing' | 'uploading' | 'done' | 'error'
  >('idle')
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [uploadedData, setUploadedData] =
    React.useState<UploadedPhotoData | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const handleProcessFile = async (file: File) => {
    // Validasi tipe berkas
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setState('error')
      setErrorMessage(
        'Format berkas tidak didukung. Harap unggah foto dengan format JPEG, PNG, atau WebP.',
      )
      return
    }

    try {
      setState('compressing')
      setErrorMessage(null)

      // 1. Kompresi gambar sisi peramban (Rule 20)
      const compressed: CompressedImageResult = await compressImageClientSide(
        file,
        1600,
        0.82,
      )

      setState('uploading')

      // 2. Minta Presigned PUT URL dari Server Function (Rule 3)
      const presignedRes = await getPresignedUploadUrl({
        data: {
          filename: file.name.replace(/\.[^/.]+$/, '') + '.webp',
          mimeType: 'image/webp',
          fileSize: compressed.sizeBytes,
          checksum: compressed.hashSha256,
        },
      })

      // 3. Upload langsung ke Cloudflare R2
      const uploadRes = await fetch(presignedRes.uploadUrl, {
        method: 'PUT',
        body: compressed.blob,
        headers: {
          'Content-Type': 'image/webp',
        },
      })

      if (!uploadRes.ok) {
        throw new Error('Gagal mengunggah foto ke penyimpanan Cloudflare R2')
      }

      const photoData: UploadedPhotoData = {
        r2ObjectKey: presignedRes.r2ObjectKey,
        fileHashSha256: compressed.hashSha256,
        exifCaptureTime: compressed.exifCaptureTime,
        previewUrl: compressed.previewUrl,
        fileName: file.name,
        fileSizeBytes: compressed.sizeBytes,
      }

      setUploadedData(photoData)
      setState('done')
      onPhotoUploaded(photoData)
    } catch (err) {
      console.error('Galat proses unggah foto:', err)
      setState('error')
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Terjadi kendala saat memproses foto bukti. Silakan coba kembali.',
      )
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleProcessFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return

    const file = e.dataTransfer.files.item(0)
    if (file) {
      handleProcessFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleRemove = () => {
    if (uploadedData?.previewUrl) {
      URL.revokeObjectURL(uploadedData.previewUrl)
    }
    setUploadedData(null)
    setState('idle')
    setErrorMessage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onPhotoRemoved()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Peringatan Keselamatan Wajib (Rule 4 & DESIGN.md 4.3) */}
      <Alert variant="destructive">
        <AlertTriangleIcon className="size-4 shrink-0" />
        <div>
          <AlertTitle>Peringatan Keselamatan Warga</AlertTitle>
          <AlertDescription>
            Ambil foto dari jarak aman dan lokasi terlindung! Dilarang mendekati
            titik api aktif demi mengambil dokumentasi. Keselamatan jiwa Anda
            adalah prioritas mutlak.
          </AlertDescription>
        </div>
      </Alert>

      {/* Input File Tersembunyi */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      {/* Tampilan Upload Selesai (Attachment Preview) */}
      {state === 'done' && uploadedData && (
        <Attachment state="done" variant="pine">
          <AttachmentMedia variant="image">
            <img
              src={uploadedData.previewUrl}
              alt="Bukti foto kebakaran"
              className="size-full object-cover"
            />
          </AttachmentMedia>
          <AttachmentContent>
            <div className="flex items-center gap-1.5">
              <CheckCircle2Icon className="size-3.5 text-[var(--color-pine)]" />
              <AttachmentTitle>{uploadedData.fileName}</AttachmentTitle>
            </div>
            <AttachmentDescription>
              {formatFileSize(uploadedData.fileSizeBytes)} (Terkompresi WebP)
              {uploadedData.exifCaptureTime && (
                <>
                  {' '}
                  ·{' '}
                  {new Date(uploadedData.exifCaptureTime).toLocaleTimeString(
                    'id-ID',
                    { hour: '2-digit', minute: '2-digit' },
                  )}{' '}
                  WIB
                </>
              )}
            </AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction
              type="button"
              onClick={handleRemove}
              aria-label="Hapus dan ganti foto bukti"
              title="Ganti foto bukti"
            >
              <Trash2Icon className="size-4" />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      )}

      {/* Tampilan Sedang Proses (Kompresi / Unggah) */}
      {(state === 'compressing' || state === 'uploading') && (
        <Attachment state="uploading">
          <AttachmentMedia variant="icon">
            <span className="text-[var(--color-ember)]">
              <Spinner />
            </span>
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>
              {state === 'compressing'
                ? 'Mengompresi Gambar di Peramban...'
                : 'Mengunggah Foto Bukti ke Penyimpanan Aman...'}
            </AttachmentTitle>
            <AttachmentDescription>
              {state === 'compressing'
                ? 'Menyesuaikan resolusi dan menghitung hash integritas'
                : 'Mengirim langsung via koneksi aman Cloudflare R2'}
            </AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      )}

      {/* Zona Drag & Drop saat Belum Ada Foto */}
      {state !== 'done' && state !== 'compressing' && state !== 'uploading' && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          className={cn(
            'group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors',
            isDragging
              ? 'border-[var(--color-ember)] bg-[var(--color-ember)]/5'
              : 'border-border/80 bg-muted/20 hover:border-foreground/30 hover:bg-muted/40',
            (error || state === 'error') &&
              'border-destructive/60 bg-destructive/5',
            disabled && 'pointer-events-none opacity-50',
          )}
        >
          <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:bg-foreground/10 group-hover:text-foreground">
            <UploadCloudIcon className="size-5" />
          </div>

          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-foreground">
              Sentuh untuk mengambil foto atau pilih dari perangkat
            </p>
            <p className="text-xs text-muted-foreground">
              Format JPEG, PNG, atau WebP (otomatis dikompresi &lt; 1 MB)
            </p>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="pointer-events-none"
            >
              <CameraIcon className="size-3.5" />
              Buka Kamera
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="pointer-events-none"
            >
              <FileImageIcon className="size-3.5" />
              Pilih Berkas
            </Button>
          </div>
        </div>
      )}

      {/* Pesan Kesalahan */}
      {(errorMessage || error) && (
        <div className="flex items-center justify-between text-xs text-destructive">
          <p>{errorMessage || error}</p>
          {state === 'error' && (
            <button
              type="button"
              onClick={() => setState('idle')}
              className="inline-flex items-center gap-1 font-medium underline"
            >
              <RefreshCwIcon className="size-3" /> Coba Lagi
            </button>
          )}
        </div>
      )}
    </div>
  )
}
