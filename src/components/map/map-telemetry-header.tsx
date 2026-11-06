import {
  ClockIcon,
  FlameIcon,
  RadioIcon,
  TruckIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'
import type { MapTelemetryStats } from '@/lib/schema/map'

interface MapTelemetryHeaderProps {
  stats: MapTelemetryStats
}

export function MapTelemetryHeader({ stats }: MapTelemetryHeaderProps) {
  return (
    <Card className="w-full">
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-6">
            {/* 1. Laporan Terverifikasi */}
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-ember)]/15 text-[var(--color-ember)]">
                <FlameIcon className="size-4.5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-muted-foreground uppercase">
                  Laporan Sah
                </span>
                <p className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                  {stats.totalVerifiedReports}
                </p>
              </div>
            </div>

            {/* 2. Titik Panas Satelit */}
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <RadioIcon className="size-4.5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-muted-foreground uppercase">
                  Titik Panas Satelit
                </span>
                <p className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                  {stats.totalActiveHotspots}
                </p>
              </div>
            </div>

            {/* 3. Operasi Penanganan */}
            <div className="col-span-2 flex items-center gap-2.5 sm:col-span-1">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--warning)]/15 text-[var(--warning-foreground)]">
                <TruckIcon className="size-4.5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-muted-foreground uppercase">
                  Sedang Ditangani
                </span>
                <p className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                  {stats.totalInHandling}
                </p>
              </div>
            </div>
          </div>

          {/* Indikator Waktu Sinkronisasi Satelit */}
          <div className="flex items-center gap-1.5 border-t border-border/50 pt-2 sm:border-t-0 sm:pt-0">
            <ClockIcon className="size-3 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">
              Sinkronisasi NASA:
            </span>
            <Badge variant="outline" size="xs">
              <span>{formatRelativeTime(stats.lastSyncedAtIso)}</span>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
