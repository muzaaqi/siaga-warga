import { Link } from '@tanstack/react-router'
import {
  ArrowRightIcon,
  ClockIcon,
  FlameIcon,
  LayersIcon,
  MapPinIcon,
  SatelliteIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ModeratorQueueItem } from '@/lib/schema/moderator'
import { formatRelativeTime } from '@/lib/utils'

interface TriageQueueCardProps {
  item: ModeratorQueueItem
}

const incidentTypeLabels: Record<string, string> = {
  karhutla: 'Karhutla',
  permukiman: 'Permukiman',
  industri: 'Industri',
  lainnya: 'Lainnya',
}

const priorityBadgeConfig: Record<
  string,
  { label: string; variant: 'destructive' | 'secondary' | 'outline' }
> = {
  high: { label: 'Mendesak', variant: 'destructive' },
  normal: { label: 'Normal', variant: 'secondary' },
  low: { label: 'Rendah', variant: 'outline' },
}

const verificationBadgeConfig: Record<
  string,
  {
    label: string
    variant: 'warning' | 'info' | 'success' | 'destructive'
  }
> = {
  pending: { label: 'Menunggu', variant: 'warning' },
  needs_review: { label: 'Perlu Tinjauan', variant: 'info' },
  verified: { label: 'Terverifikasi', variant: 'success' },
  insufficient_evidence: { label: 'Bukti Kurang', variant: 'destructive' },
  rejected: { label: 'Ditolak', variant: 'destructive' },
}

export function TriageQueueCard({ item }: TriageQueueCardProps) {
  const priorityConfig = priorityBadgeConfig[item.priority]
  const verificationConfig = verificationBadgeConfig[item.verificationStatus]

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {/* Thumbnail Foto Bukti */}
          <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:h-28 sm:w-28">
            {item.evidenceThumbnailUrl ? (
              <img
                src={item.evidenceThumbnailUrl}
                alt={`Bukti laporan ${item.trackingCode}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <FlameIcon className="size-8" />
              </div>
            )}
            {item.evidenceCount > 1 ? (
              <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                +{item.evidenceCount - 1} foto
              </span>
            ) : null}
          </div>

          {/* Konten Laporan & Metadata */}
          <div className="flex flex-1 flex-col justify-between gap-2.5">
            <div>
              {/* Baris Atas: Kode Lacak & Lencana Status */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold tracking-tight text-foreground sm:text-base">
                    {item.trackingCode}
                  </span>
                  <Badge variant="outline" size="xs">
                    {incidentTypeLabels[item.incidentType] || item.incidentType}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant={priorityConfig.variant} size="xs">
                    {priorityConfig.label}
                  </Badge>
                  <Badge variant={verificationConfig.variant} size="xs">
                    {verificationConfig.label}
                  </Badge>
                </div>
              </div>

              {/* Baris Indikator Spasial & Satelit */}
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {item.satelliteHotspotMatched ? (
                  <Badge variant="outline" size="xs">
                    <SatelliteIcon className="mr-1 size-3" />
                    Satelit Cocok
                  </Badge>
                ) : null}

                {item.isPotentialDuplicate ? (
                  <Badge variant="outline" size="xs">
                    <LayersIcon className="mr-1 size-3" />
                    Klaster Sekitar
                  </Badge>
                ) : null}
              </div>

              {/* Deskripsi Singkat */}
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {item.description}
              </p>
            </div>

            {/* Baris Bawah: Waktu, Alamat & Tombol Aksi */}
            <div className="mt-1 flex flex-col gap-2 pt-2 border-t border-border sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1 text-[11px] text-muted-foreground sm:text-xs">
                {item.addressDisplay ? (
                  <div className="flex items-center gap-1 truncate">
                    <MapPinIcon className="size-3.5 shrink-0" />
                    <span className="truncate">{item.addressDisplay}</span>
                  </div>
                ) : null}
                <div className="flex items-center gap-1">
                  <ClockIcon className="size-3.5 shrink-0" />
                  <span>Masuk {formatRelativeTime(item.submittedAt)}</span>
                </div>
              </div>

              <Button
                variant="default"
                size="sm"
                render={
                  <Link
                    to="/admin/laporan/$id"
                    params={{ id: item.id }}
                  />
                }
              >
                <span>Tinjau Laporan</span>
                <ArrowRightIcon className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
