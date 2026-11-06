import {
  createFileRoute,
  useRouter,
  Link,
} from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getReportByTrackingCode } from '@/server/functions/tracking'
import { TrackingOverviewCard } from '@/components/tracking/tracking-overview-card'
import { TrackingStepper } from '@/components/tracking/tracking-stepper'
import { TrackingEvidenceCard } from '@/components/tracking/tracking-evidence-card'
import { TrackingLocationCard } from '@/components/tracking/tracking-location-card'
import { TrackingAuditTimeline } from '@/components/tracking/tracking-audit-timeline'
import { TrackingNotFound } from '@/components/tracking/tracking-not-found'

export const Route = createFileRoute('/lacak/$code')({
  loader: async ({ params }) => {
    try {
      const report = await getReportByTrackingCode({
        data: {
          trackingCode: params.code,
        },
      })
      return { report, code: params.code }
    } catch {
      return { report: null, code: params.code }
    }
  },
  head: ({ params }) => ({
    meta: [
      {
        title: `Status Laporan ${params.code} | SiagaWarga`,
      },
      {
        name: 'description',
        content: `Pantau linimasa transparansi penanganan laporan kebakaran ${params.code} secara langsung melalui audit 4 fase SiagaWarga.`,
      },
    ],
  }),
  pendingComponent: LacakPending,
  errorComponent: LacakError,
  component: LacakPage,
})

function LacakPage() {
  const { report, code } = Route.useLoaderData()

  if (!report) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
        <TrackingNotFound searchedCode={code} />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:py-12">
      {/* Navigasi Breadcrumb Kembali */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          to="/"
          className="flex items-center gap-1 transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          <span>Beranda</span>
        </Link>
        <span>/</span>
        <span className="font-mono font-medium text-foreground">{code}</span>
      </nav>

      {/* Header Halaman Pelacakan */}
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="size-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Status & Linimasa Penanganan Laporan
          </h1>
        </div>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Pantau transparansi proses verifikasi bukti dan tindak lanjut penanganan
          lapangan secara aktual tanpa rekayasa data.
        </p>
      </header>

      {/* 1. Kartu Ringkasan Tiket Pelacakan */}
      <TrackingOverviewCard report={report} />

      {/* 2. Stepper Audit 4 Fase */}
      <TrackingStepper phases={report.phases} />

      {/* 3. Grid Bukti Foto & Peta Lokasi Tersamar */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <TrackingEvidenceCard
          evidence={report.evidence}
          observedAtIso={report.observedAtIso}
        />
        <TrackingLocationCard
          maskedLocation={report.maskedLocation}
          addressDisplay={report.addressDisplay}
        />
      </div>

      {/* 4. Buku Catatan Verifikasi Resmi (Audit History) */}
      <TrackingAuditTimeline auditHistory={report.auditHistory} />
    </div>
  )
}

function LacakPending() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:py-12">
      <Skeleton className="h-4 w-28" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-3/4 max-w-md" />
        <Skeleton className="h-4 w-1/2 max-w-sm" />
      </div>

      {/* Overview Card Skeleton */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-20 w-full" />
      </div>

      {/* Stepper Skeleton */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    </div>
  )
}

function LacakError({ error }: ErrorComponentProps) {
  const router = useRouter()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <Alert variant="destructive">
        <AlertCircleIcon className="size-4" />
        <AlertTitle>Gagal Memuat Data Pelacakan</AlertTitle>
        <AlertDescription>
          <div className="space-y-4 pt-2">
            <p>
              {error instanceof Error
                ? error.message
                : 'Terjadi kendala saat menyambungkan data status penanganan laporan.'}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.invalidate()}
              >
                <RotateCcwIcon className="size-3.5" />
                <span>Coba Lagi</span>
              </Button>

              <Button
                size="sm"
                variant="secondary"
                render={<Link to="/" />}
              >
                <ArrowLeftIcon className="size-3.5" />
                <span>Kembali ke Beranda</span>
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
