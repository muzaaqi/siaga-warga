import * as React from 'react'
import {
  CameraIcon,
  CheckCircle2Icon,
  FileCodeIcon,
  ImageIcon,
  ZoomInIcon,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ResponsiveOverlay,
  ResponsiveOverlayContent,
} from '@/components/ui/responsive-overlay'
import { formatFullDateTime } from '@/lib/utils'
import type { TrackingEvidence } from '@/lib/schema/tracking'

interface TrackingEvidenceCardProps {
  evidence: TrackingEvidence | null
  observedAtIso: string
}

export function TrackingEvidenceCard({
  evidence,
  observedAtIso,
}: TrackingEvidenceCardProps) {
  const [zoomOpen, setZoomOpen] = React.useState(false)

  if (!evidence) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Bukti Foto Lapangan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center text-muted-foreground">
            <ImageIcon className="mb-2 size-8 text-muted-foreground/60" />
            <p className="text-xs font-medium">Foto bukti tidak tersedia.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    }
    return `${(bytes / 1024).toFixed(0)} KB`
  }

  const truncatedHash = `${evidence.fileHashSha256.slice(0, 10)}...${evidence.fileHashSha256.slice(-8)}`

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle>Bukti Foto Lapangan</CardTitle>
              <p className="text-xs text-muted-foreground">
                Dokumentasi terunggah langsung dari gawai saksi di lokasi aman.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setZoomOpen(true)}
            >
              <ZoomInIcon className="size-3.5" />
              <span>Perbesar</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* 4:3 Image Container with Click-to-Zoom */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setZoomOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setZoomOpen(true)
                }
              }}
              className="group relative aspect-4/3 w-full cursor-zoom-in overflow-hidden rounded-lg border border-border bg-muted focus:ring-2 focus:ring-primary focus:outline-none"
              aria-label="Lihat foto bukti resolusi penuh"
            >
              <img
                src={evidence.mediaUrl}
                alt="Bukti foto kebakaran lapangan"
                className="size-full object-cover transition-transform duration-300 group-hover:scale-102"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <span className="flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-xs">
                  <ZoomInIcon className="size-3.5" />
                  Klik untuk melihat resolusi penuh
                </span>
              </div>
            </div>

            {/* Technical Metadata Box */}
            <div className="grid grid-cols-1 gap-2.5 rounded-lg border border-border/70 bg-muted/30 p-3 sm:grid-cols-2">
              <div className="flex items-start gap-2 text-xs">
                <CameraIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <div>
                  <span className="font-medium text-muted-foreground">
                    Waktu Pemotretan EXIF:
                  </span>
                  <p className="font-semibold text-foreground">
                    {evidence.exifCaptureTimeIso
                      ? formatFullDateTime(evidence.exifCaptureTimeIso)
                      : 'Tidak terdeteksi (Waktu Laporan)'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs">
                <FileCodeIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <div>
                  <span className="font-medium text-muted-foreground">
                    Ukuran & Tipe Berkas:
                  </span>
                  <p className="font-semibold text-foreground">
                    {formatFileSize(evidence.fileSizeBytes)} ({evidence.mimeType})
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs sm:col-span-2">
                <CheckCircle2Icon className="mt-0.5 size-3.5 shrink-0 text-[var(--success)]" />
                <div className="overflow-hidden">
                  <span className="font-medium text-muted-foreground">
                    Integritas Berkas SHA-256:
                  </span>
                  <p className="truncate font-mono text-[11px] text-foreground" title={evidence.fileHashSha256}>
                    {truncatedHash} (Terverifikasi)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responsive Full-Screen Dialog Zoom */}
      <ResponsiveOverlay open={zoomOpen} onOpenChange={setZoomOpen}>
        <ResponsiveOverlayContent
          title="Pratinjau Bukti Foto Resolusi Penuh"
          description="Foto asli yang diambil langsung dari kamera gawai pelapor."
          className="max-w-3xl"
        >
          <div className="my-2 flex flex-col items-center gap-4">
            <div className="max-h-[70vh] w-full overflow-hidden rounded-lg border border-border bg-black/90">
              <img
                src={evidence.mediaUrl}
                alt="Bukti foto resolusi penuh"
                className="size-full max-h-[70vh] object-contain"
              />
            </div>

            <div className="w-full space-y-1 rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <p>
                <strong className="text-foreground">Waktu Pengamatan:</strong>{' '}
                {formatFullDateTime(observedAtIso)}
              </p>
              <p className="break-all font-mono text-[11px]">
                <strong className="font-sans text-foreground">Hash SHA-256:</strong>{' '}
                {evidence.fileHashSha256}
              </p>
            </div>
          </div>
        </ResponsiveOverlayContent>
      </ResponsiveOverlay>
    </>
  )
}
