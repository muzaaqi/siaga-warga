import {
  FileTextIcon,
  HistoryIcon,
  ShieldCheckIcon,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatFullDateTime } from '@/lib/utils'
import type { TrackingAuditEntry } from '@/lib/schema/tracking'

interface TrackingAuditTimelineProps {
  auditHistory: Array<TrackingAuditEntry>
}

export function TrackingAuditTimeline({
  auditHistory,
}: TrackingAuditTimelineProps) {
  const getStatusTypeLabel = (type: string) => {
    switch (type) {
      case 'verification':
        return 'Status Verifikasi'
      case 'handling':
        return 'Penanganan Lapangan'
      case 'priority':
        return 'Tingkat Urgensi'
      default:
        return type
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <HistoryIcon className="size-4 text-primary" />
          <CardTitle>Buku Catatan Verifikasi Resmi</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Seluruh pembaruan dan alasan penanganan dicatat secara permanen tanpa
          perubahan data sepihak (Rule 8: Immutable Audit Trail).
        </p>
      </CardHeader>

      <CardContent>
        {auditHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center">
            <FileTextIcon className="mb-2 size-7 text-muted-foreground/60" />
            <p className="text-xs font-medium text-muted-foreground">
              Belum ada catatan riwayat tambahan dari verifikator posko.
            </p>
            <p className="text-[11px] text-muted-foreground/80">
              Laporan baru terdaftar dan sedang dalam giliran peninjauan tim darurat.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {auditHistory.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-border/80 bg-muted/30 p-3 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" size="xs">
                      <ShieldCheckIcon className="size-3 text-primary" />
                      <span>{entry.changedBy}</span>
                    </Badge>

                    <span className="font-semibold text-foreground">
                      {getStatusTypeLabel(entry.statusType)}
                    </span>
                  </div>

                  <span className="text-[11px] text-muted-foreground">
                    {formatFullDateTime(entry.createdAtIso)}
                  </span>
                </div>

                <div className="mt-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span>Perubahan status:</span>
                    <span className="font-mono font-medium text-foreground">
                      {entry.previousValue || 'Awal'} &rarr; {entry.newValue}
                    </span>
                  </div>

                  <div className="rounded-md border border-border/60 bg-background/80 p-2 text-xs text-foreground">
                    <span className="font-medium text-muted-foreground">
                      Catatan Alasan Resmi:
                    </span>{' '}
                    {entry.reasonNote}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
