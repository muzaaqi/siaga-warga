import * as React from 'react'
import {
  AlertTriangleIcon,
  CameraIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  FileCheckIcon,
  FlameIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { ModeratorEvidence } from '@/lib/schema/moderator'
import { formatFullDateTime } from '@/lib/utils'

interface IncidentEvidenceViewerProps {
  evidence: Array<ModeratorEvidence>
  observedAt: string
}

export function IncidentEvidenceViewer({
  evidence,
  observedAt,
}: IncidentEvidenceViewerProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  if (evidence.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FlameIcon className="size-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              Tidak ada foto bukti terlampir pada laporan ini.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const selectedEvidence = evidence[selectedIndex] || evidence[0]

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bukti Foto Kejadian ({evidence.length})</CardTitle>
        <CardAction>
          <a
            href={selectedEvidence.mediaUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <span>Buka Gambar Penuh</span>
            <ExternalLinkIcon className="size-3.5" />
          </a>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Gambar Utama */}
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-black/5 dark:bg-white/5">
            <img
              src={selectedEvidence.mediaUrl}
              alt="Bukti foto kejadian insiden kebakaran"
              className="h-full w-full object-contain"
            />
          </div>

          {/* Galeri Thumbnail Jika > 1 Foto */}
          {evidence.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {evidence.map((ev, idx) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative size-16 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                    selectedIndex === idx
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={ev.mediaUrl}
                    alt={`Thumbnail bukti ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}

          {/* Panel Komparasi EXIF Kamera vs Waktu Pengamatan */}
          <div className="rounded-lg border border-border p-3.5 sm:p-4">
            <div className="flex items-center gap-2 pb-2">
              <CameraIcon className="size-4 text-muted-foreground" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:text-sm">
                Analisis Konsistensi Waktu Pengamatan
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">
                  Klaim Waktu Pengamatan Warga:
                </span>
                <span className="text-xs font-medium text-foreground sm:text-sm">
                  {formatFullDateTime(observedAt)}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">
                  Waktu Asli Kamera (Metadata EXIF):
                </span>
                <span className="text-xs font-medium text-foreground sm:text-sm">
                  {selectedEvidence.exifCaptureTime
                    ? formatFullDateTime(selectedEvidence.exifCaptureTime)
                    : 'Metadata kamera tidak terbaca (Ponsel non-EXIF)'}
                </span>
              </div>
            </div>

            {/* Indikator Status Keselarasan Waktu */}
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Hasil Analisis:
              </span>
              {selectedEvidence.isExifConsistent === true ? (
                <Badge variant="success" size="xs">
                  <CheckCircle2Icon className="mr-1 size-3" />
                  <span>
                    Waktu Kamera Selaras (Selisih{' '}
                    {selectedEvidence.timeDiscrepancyMinutes} menit)
                  </span>
                </Badge>
              ) : selectedEvidence.isExifConsistent === false ? (
                <Badge variant="destructive" size="xs">
                  <AlertTriangleIcon className="mr-1 size-3" />
                  <span>
                    Anomali Waktu Terdeteksi (Selisih{' '}
                    {selectedEvidence.timeDiscrepancyMinutes} menit)
                  </span>
                </Badge>
              ) : (
                <Badge variant="outline" size="xs">
                  Metadata Waktu Tidak Tersedia
                </Badge>
              )}
            </div>
          </div>

          {/* Informasi Teknis Integritas Berkas */}
          <div className="flex flex-col gap-1 text-[11px] text-muted-foreground sm:text-xs">
            <div className="flex items-center gap-1.5">
              <FileCheckIcon className="size-3.5 shrink-0" />
              <span>
                Ukuran: {formatFileSize(selectedEvidence.fileSizeBytes)} (
                {selectedEvidence.mimeType})
              </span>
            </div>
            <div className="truncate font-mono">
              SHA-256: {selectedEvidence.fileHashSha256}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
