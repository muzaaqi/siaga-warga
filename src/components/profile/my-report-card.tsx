import * as React from 'react'
import { Link } from '@tanstack/react-router'
import {
  FlameIcon,
  MapPinIcon,
  ClockIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  Loader2Icon,
  XCircleIcon,
  ShieldIcon,
  EyeIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { MyReportItem } from '@/lib/schema/profile'

const incidentTypeLabels: Record<string, string> = {
  karhutla: 'Kebakaran Hutan & Lahan',
  permukiman: 'Kebakaran Permukiman',
  industri: 'Kebakaran Industri',
  lainnya: 'Lainnya',
}

const verificationStatusLabels: Record<
  string,
  {
    label: string
    variant: 'default' | 'success' | 'warning' | 'destructive' | 'info'
  }
> = {
  pending: { label: 'Menunggu', variant: 'warning' },
  needs_review: { label: 'Perlu Tinjau', variant: 'info' },
  verified: { label: 'Terverifikasi', variant: 'success' },
  insufficient_evidence: { label: 'Bukti Kurang', variant: 'destructive' },
  rejected: { label: 'Ditolak', variant: 'destructive' },
}

const handlingStatusLabels: Record<
  string,
  {
    label: string
    variant: 'default' | 'success' | 'warning' | 'destructive' | 'info'
  }
> = {
  not_forwarded: { label: 'Belum Diteruskan', variant: 'default' },
  forwarded: { label: 'Diteruskan', variant: 'info' },
  acknowledged: { label: 'Dikonfirmasi', variant: 'warning' },
  in_progress: { label: 'Ditangani', variant: 'warning' },
  resolved: { label: 'Selesai', variant: 'success' },
  unknown: { label: 'Tidak Diketahui', variant: 'default' },
}

const verificationIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  pending: ClockIcon,
  needs_review: AlertTriangleIcon,
  verified: CheckCircleIcon,
  insufficient_evidence: XCircleIcon,
  rejected: XCircleIcon,
}

const handlingIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  not_forwarded: FlameIcon,
  forwarded: ShieldIcon,
  acknowledged: CheckCircleIcon,
  in_progress: Loader2Icon,
  resolved: CheckCircleIcon,
  unknown: AlertTriangleIcon,
}

interface MyReportCardProps {
  report: MyReportItem
  className?: string
}

export function MyReportCard({ report, className }: MyReportCardProps) {
  const verification = verificationStatusLabels[report.verificationStatus] ?? {
    label: report.verificationStatus,
    variant: 'default',
  }
  const handling = handlingStatusLabels[report.handlingStatus] ?? {
    label: report.handlingStatus,
    variant: 'default',
  }
  const VerificationIcon =
    verificationIcons[report.verificationStatus] ?? AlertTriangleIcon
  const HandlingIcon = handlingIcons[report.handlingStatus] ?? FlameIcon

  const formatDate = (iso: string) => {
    const date = new Date(iso)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card variant="elevated" className={cn('group overflow-hidden', className)}>
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline" size="xs">
                <FlameIcon className="size-3" />
                {incidentTypeLabels[report.incidentType] ?? report.incidentType}
              </Badge>
              {report.isPotentialDuplicate && (
                <Badge variant="warning" size="xs">
                  <AlertTriangleIcon className="size-3" />
                  Duplikat Potensial
                </Badge>
              )}
            </div>

            <Link
              to="/lacak/$code"
              params={{ code: report.trackingCode }}
              className="group block"
            >
              <h3 className="line-clamp-2 font-semibold text-foreground transition-colors group-hover:text-primary">
                {report.description}
              </h3>
            </Link>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPinIcon className="size-3" />
                {report.addressDisplay ?? 'Lokasi tidak tersedia'}
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon className="size-3" />
                {formatDate(report.submittedAtIso)}
              </span>
              <span className="flex items-center gap-1">
                <ShieldIcon className="size-3" />
                Kode: {report.trackingCode}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <div className="flex items-center gap-1.5">
              <Badge variant={verification.variant} size="xs">
                <VerificationIcon className="size-3" />
                {verification.label}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant={handling.variant} size="xs">
                <HandlingIcon className="size-3" />
                {handling.label}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-4">
          <Link
            to="/lacak/$code"
            params={{ code: report.trackingCode }}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <EyeIcon className="size-3.5" />
            Lacak
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
