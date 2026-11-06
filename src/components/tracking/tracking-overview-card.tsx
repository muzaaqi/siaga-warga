import * as React from 'react'
import { Link } from '@tanstack/react-router'
import {
  CheckIcon,
  CopyIcon,
  FlameIcon,
  PlusCircleIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  ClockIcon,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatFullDateTime, formatRelativeTime } from '@/lib/utils'
import type { ReportTrackingDetail } from '@/lib/schema/tracking'

interface TrackingOverviewCardProps {
  report: ReportTrackingDetail
}

export function TrackingOverviewCard({ report }: TrackingOverviewCardProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopyLink = React.useCallback(async () => {
    try {
      const url =
        typeof window !== 'undefined'
          ? window.location.href
          : `https://siagawarga.id/lacak/${report.trackingCode}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback diam jika clipboard API ditolak
    }
  }, [report.trackingCode])

  const incidentTypeLabels: Record<string, string> = {
    karhutla: 'Kebakaran Hutan & Lahan',
    permukiman: 'Kebakaran Permukiman',
    industri: 'Kebakaran Industri',
    lainnya: 'Kebakaran Lainnya',
  }

  const priorityBadgeVariant =
    report.priority === 'high'
      ? 'destructive'
      : report.priority === 'normal'
        ? 'warning'
        : 'secondary'

  const priorityLabels: Record<string, string> = {
    high: 'Prioritas Tinggi',
    normal: 'Prioritas Normal',
    low: 'Prioritas Rendah',
  }

  const verificationBadgeVariant =
    report.verificationStatus === 'verified'
      ? 'success'
      : report.verificationStatus === 'rejected' ||
          report.verificationStatus === 'insufficient_evidence'
        ? 'destructive'
        : 'info'

  const verificationLabels: Record<string, string> = {
    pending: 'Menunggu Verifikasi',
    needs_review: 'Uji Silang Lapangan',
    verified: 'Terverifikasi Sah',
    insufficient_evidence: 'Bukti Kurang',
    rejected: 'Laporan Ditolak',
  }

  const handlingBadgeVariant =
    report.handlingStatus === 'resolved'
      ? 'success'
      : report.handlingStatus === 'in_progress' ||
          report.handlingStatus === 'forwarded' ||
          report.handlingStatus === 'acknowledged'
        ? 'warning'
        : 'secondary'

  const handlingLabels: Record<string, string> = {
    not_forwarded: 'Belum Diteruskan',
    forwarded: 'Diteruskan ke Damkar/BPBD',
    acknowledged: 'Terkonfirmasi Instansi',
    in_progress: 'Operasi Pemadaman',
    resolved: 'Selesai / Teratasi',
    unknown: 'Status Belum Diketahui',
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Kode Pelacakan Resmi
            </span>
            <CardTitle>
              <span className="font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {report.trackingCode}
              </span>
            </CardTitle>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <CheckIcon className="size-3.5 text-[var(--success)]" />
                  <span>Tautan Tersalin!</span>
                </>
              ) : (
                <>
                  <CopyIcon className="size-3.5" />
                  <span>Salin Tautan</span>
                </>
              )}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              render={<Link to="/lapor" />}
            >
              <PlusCircleIcon className="size-3.5" />
              <span>Lapor Baru</span>
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" size="xs">
            <FlameIcon className="size-3 text-primary" />
            <span>{incidentTypeLabels[report.incidentType] || report.incidentType}</span>
          </Badge>

          <Badge variant={verificationBadgeVariant} size="xs">
            {report.verificationStatus === 'verified' ? (
              <ShieldCheckIcon className="size-3" />
            ) : (
              <ShieldAlertIcon className="size-3" />
            )}
            <span>
              {verificationLabels[report.verificationStatus] ||
                report.verificationStatus}
            </span>
          </Badge>

          <Badge variant={handlingBadgeVariant} size="xs">
            <span>{handlingLabels[report.handlingStatus] || report.handlingStatus}</span>
          </Badge>

          <Badge variant={priorityBadgeVariant} size="xs">
            <span>{priorityLabels[report.priority] || report.priority}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-3 rounded-lg border border-border/60 bg-muted/40 p-3.5 sm:grid-cols-2">
          <div className="flex items-start gap-2.5">
            <ClockIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="space-y-0.5 text-xs">
              <span className="font-medium text-muted-foreground">
                Waktu Kejadian Dilihat
              </span>
              <p className="font-medium text-foreground">
                {formatFullDateTime(report.observedAtIso)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <ClockIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="space-y-0.5 text-xs">
              <span className="font-medium text-muted-foreground">
                Waktu Pengiriman Laporan
              </span>
              <p className="font-medium text-foreground">
                {formatRelativeTime(report.submittedAtIso)} (
                {formatFullDateTime(report.submittedAtIso)})
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Deskripsi Saksi Mata
          </span>
          <p className="text-sm leading-relaxed text-foreground">
            {report.description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
