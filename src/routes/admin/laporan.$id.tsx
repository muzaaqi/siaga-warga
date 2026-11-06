import * as React from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  ClockIcon,
  EditIcon,
  RotateCcwIcon,
  ShieldAlertIcon,
} from 'lucide-react'
import { IncidentAuditTimeline } from '@/components/triage/incident-audit-timeline'
import { IncidentContextCards } from '@/components/triage/incident-context-cards'
import { IncidentEvidenceViewer } from '@/components/triage/incident-evidence-viewer'
import { IncidentReporterCard } from '@/components/triage/incident-reporter-card'
import { StatusChangeDialog } from '@/components/triage/status-change-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { ModeratorReportDetail } from '@/lib/schema/moderator'
import { formatFullDateTime, formatRelativeTime } from '@/lib/utils'
import { getAuthSession } from '@/server/functions/auth'
import { getModeratorReportDetail } from '@/server/functions/moderator'

export const Route = createFileRoute('/admin/laporan/$id')({
  head: () => ({
    meta: [
      {
        title: 'Peninjauan Laporan Insiden | SiagaWarga',
      },
      {
        name: 'description',
        content:
          'Evaluasi bukti kejadian, komparasi metadata kamera, dan verifikasi laporan insiden kebakaran.',
      },
    ],
  }),
  loader: async ({
    params,
  }): Promise<{
    authorized: boolean
    report: ModeratorReportDetail | null
  }> => {
    try {
      const session = await getAuthSession()
      const user = session?.user
      const role = user ? user.role : undefined

      if (!user || (role !== 'moderator' && role !== 'superadmin')) {
        return {
          authorized: false,
          report: null,
        }
      }

      const report = await getModeratorReportDetail({
        data: { reportId: params.id },
      })

      return {
        authorized: true,
        report,
      }
    } catch {
      return {
        authorized: false,
        report: null,
      }
    }
  },
  pendingComponent: LaporanDetailPending,
  errorComponent: LaporanDetailError,
  component: AdminLaporanDetailPage,
})

function AdminLaporanDetailPage() {
  const loaderData = Route.useLoaderData()
  const router = useRouter()
  const [isStatusDialogOpen, setIsStatusDialogOpen] = React.useState(false)

  if (!loaderData.authorized || !loaderData.report) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center sm:py-16">
              <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive sm:size-14">
                <ShieldAlertIcon className="size-6 sm:size-7" />
              </div>
              <h2 className="mt-4 text-base font-bold text-foreground sm:text-xl">
                Hak Akses Khusus Moderator
              </h2>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Halaman peninjauan ini hanya dapat diakses oleh verifikator resmi
                atau administrator sistem.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link to="/admin/triase" />}
                >
                  Kembali ke Antrean
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const report: ModeratorReportDetail = loaderData.report

  const priorityVariantMap: Record<
    string,
    'destructive' | 'secondary' | 'outline'
  > = {
    high: 'destructive',
    normal: 'secondary',
    low: 'outline',
  }

  const verificationVariantMap: Record<
    string,
    'warning' | 'info' | 'success' | 'destructive'
  > = {
    pending: 'warning',
    needs_review: 'info',
    verified: 'success',
    insufficient_evidence: 'destructive',
    rejected: 'destructive',
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Tombol Kembali ke Antrean */}
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          render={<Link to="/admin/triase" />}
        >
          <ArrowLeftIcon className="size-4" />
          <span>Kembali ke Dasbor Triase</span>
        </Button>
      </div>

      {/* Header Laporan */}
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {report.trackingCode}
            </h1>
            <Badge variant="outline" size="xs">
              {report.incidentType.toUpperCase()}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge
              variant={priorityVariantMap[report.priority]}
              size="xs"
            >
              Prioritas: {report.priority.toUpperCase()}
            </Badge>
            <Badge
              variant={verificationVariantMap[report.verificationStatus]}
              size="xs"
            >
              Verifikasi: {report.verificationStatus.toUpperCase()}
            </Badge>
            <Badge variant="outline" size="xs">
              Penanganan: {report.handlingStatus.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Tombol Aksi Verifikator */}
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsStatusDialogOpen(true)}
        >
          <EditIcon className="size-4" />
          <span>Ubah Status Laporan</span>
        </Button>
      </div>

      {/* Kartu Deskripsi Laporan */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="text-sm font-semibold sm:text-base">
                Deskripsi Kejadian dari Pelapor
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 text-xs sm:text-sm">
              <p className="leading-relaxed text-foreground whitespace-pre-wrap">
                {report.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 border-t border-border pt-2.5 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ClockIcon className="size-3.5" />
                  <span>
                    Waktu Pengamatan: {formatFullDateTime(report.observedAt)}
                  </span>
                </div>
                <div>
                  Dilaporkan: {formatRelativeTime(report.submittedAt)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid 2-Kolom Tata Letak Operasional */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom Kiri: Penampil Bukti & Linimasa Audit */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <IncidentEvidenceViewer
            evidence={report.evidence}
            observedAt={report.observedAt}
          />

          <IncidentAuditTimeline history={report.statusHistory} />
        </div>

        {/* Kolom Kanan: Identitas Pelapor & Konteks Geospasial */}
        <div className="flex flex-col gap-6">
          <IncidentReporterCard
            isAnonymous={report.isAnonymous}
            reporterName={report.reporterName}
            reporterPhone={report.reporterPhone}
            reporterEmail={report.reporterEmail}
          />

          <IncidentContextCards
            latitude={report.latitude}
            longitude={report.longitude}
            addressDisplay={report.addressDisplay}
            nearbyClusterReports={report.nearbyClusterReports}
            nearbySatelliteHotspots={report.nearbySatelliteHotspots}
          />
        </div>
      </div>

      {/* Dialog Ubah Status */}
      <StatusChangeDialog
        reportId={report.id}
        currentVerification={report.verificationStatus}
        currentHandling={report.handlingStatus}
        currentPriority={report.priority}
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        onSuccess={() => {
          router.invalidate()
        }}
      />
    </div>
  )
}

function LaporanDetailPending() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="mb-4">
        <Skeleton className="h-8 w-44" />
      </div>

      <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl border border-border p-6 sm:flex-row">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      <Skeleton shape="card" className="mb-6 h-28 w-full" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton shape="card" className="h-72 w-full" />
          <Skeleton shape="card" className="h-48 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton shape="card" className="h-36 w-full" />
          <Skeleton shape="card" className="h-64 w-full" />
        </div>
      </div>
    </div>
  )
}

function LaporanDetailError({ error, reset }: ErrorComponentProps) {
  const router = useRouter()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <Alert variant="destructive">
        <AlertCircleIcon className="h-4 w-4" />
        <AlertTitle>Gagal Memuat Detail Laporan</AlertTitle>
        <AlertDescription className="mt-1">
          {error instanceof Error
            ? error.message
            : 'Laporan tidak ditemukan atau terjadi kendala saat memuat data peninjauan.'}
        </AlertDescription>
      </Alert>

      <div className="mt-4 flex items-center gap-3">
        <Button
          variant="default"
          size="sm"
          onClick={() => {
            reset()
            router.invalidate()
          }}
        >
          <RotateCcwIcon className="size-3.5" />
          <span>Coba Lagi</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          render={<Link to="/admin/triase" />}
        >
          Kembali ke Dasbor Triase
        </Button>
      </div>
    </div>
  )
}
