import { ClockIcon, FileTextIcon, HistoryIcon, UserIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ReportAuditHistoryItem } from '@/lib/schema/moderator'
import { formatFullDateTime } from '@/lib/utils'

interface IncidentAuditTimelineProps {
  history: Array<ReportAuditHistoryItem>
}

const statusTypeLabels: Record<string, string> = {
  verification: 'Verifikasi Bukti',
  handling: 'Penanganan Lapangan',
  priority: 'Tingkat Prioritas',
}

export function IncidentAuditTimeline({ history }: IncidentAuditTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2 text-sm font-semibold sm:text-base">
            <HistoryIcon className="size-4 text-primary" />
            <span>Linimasa Catatan Audit Imutabel ({history.length})</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Belum ada riwayat audit perubahan status pada laporan ini.
          </p>
        ) : (
          <div className="relative border-l border-border pl-4 ml-2 flex flex-col gap-5">
            {history.map((entry) => (
              <div key={entry.id} className="relative flex flex-col gap-1.5">
                {/* Node Titik */}
                <span className="absolute -left-[21px] top-1 size-2.5 rounded-full border border-background bg-primary" />

                {/* Baris Moderator & Waktu */}
                <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <UserIcon className="size-3.5 text-muted-foreground" />
                    <span>{entry.changedBy}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <ClockIcon className="size-3" />
                    <span>{formatFullDateTime(entry.createdAt)}</span>
                  </div>
                </div>

                {/* Baris Transisi Status */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <Badge variant="outline" size="xs">
                    {statusTypeLabels[entry.statusType] || entry.statusType}
                  </Badge>
                  <span className="text-muted-foreground">dari</span>
                  <span className="font-mono font-medium text-muted-foreground">
                    {entry.previousValue || '(Awal)'}
                  </span>
                  <span className="text-muted-foreground">ke</span>
                  <Badge variant="secondary" size="xs">
                    {entry.newValue}
                  </Badge>
                </div>

                {/* Catatan Alasan Wajib */}
                <div className="rounded-md bg-muted/60 p-2.5 text-xs leading-relaxed text-foreground">
                  <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <FileTextIcon className="size-3" />
                    <span>Catatan Alasan Verifikasi:</span>
                  </div>
                  <p className="italic">"{entry.reasonNote}"</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
