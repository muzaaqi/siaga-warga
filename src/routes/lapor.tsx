import { createFileRoute, Link } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import {
  ChevronRightIcon,
  FlameIcon,
  PhoneCallIcon,
  RotateCcwIcon,
  ShieldAlertIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ReportForm } from '@/components/report/report-form'

export const Route = createFileRoute('/lapor')({
  head: () => ({
    meta: [
      {
        title: 'Laporkan Kebakaran Hutan atau Permukiman | SiagaWarga',
      },
      {
        name: 'description',
        content:
          'Kirimkan laporan kebakaran hutan dan lahan (karhutla) atau permukiman dengan koordinat presisi dan bukti foto terverifikasi untuk mempercepat tindakan petugas penanggulangan.',
      },
    ],
  }),
  pendingComponent: LaporPending,
  errorComponent: LaporError,
  component: LaporPage,
})

function LaporPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Breadcrumb Navigasi */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground"
      >
        <Link to="/" className="transition-colors hover:text-foreground">
          Beranda
        </Link>
        <ChevronRightIcon className="size-3.5 text-muted-foreground/60" />
        <span className="font-medium text-foreground">Laporkan Insiden</span>
      </nav>

      {/* Header Halaman Utama (Rule 15 & DESIGN.md) */}
      <header className="mb-8 flex flex-col gap-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-ember)]/30 bg-[var(--color-ember)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-ember)]">
          <FlameIcon className="size-3.5" />
          <span>Formulir Pelaporan Terbuka</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          Laporkan Kebakaran Hutan atau Permukiman
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Sampaikan data kejadian secara faktual dengan bukti foto dan koordinat
          lokasi presisi. Data Anda akan ditriase dan diverifikasi secara
          transparan untuk mempercepat koordinasi pemadaman di lapangan.
        </p>
      </header>

      {/* Hotline Cepat Tanggap jika Mengancam Jiwa */}
      <Card variant="canvas" className="mb-8">
        <CardContent>
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-danger)]/10 text-[var(--color-danger)]">
                <PhoneCallIcon className="size-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground">
                  Kondisi Mengancam Keselamatan Jiwa?
                </span>
                <span className="text-xs text-muted-foreground">
                  Jika api aktif telah menjalar dekat pemukiman, segera telepon
                  langsung saluran darurat bebas pulsa.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="tel:112"
                className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-xs font-bold text-foreground transition-colors hover:bg-muted"
              >
                112 (Darurat)
              </a>
              <a
                href="tel:113"
                className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-xs font-bold text-[var(--color-danger)] transition-colors hover:bg-muted"
              >
                113 (Damkar)
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulir Pelaporan Inti */}
      <ReportForm />
    </div>
  )
}

function LaporPending() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <Skeleton className="mb-4 h-5 w-32" />
      <Skeleton className="mb-2 h-10 w-3/4" />
      <Skeleton className="mb-8 h-4 w-1/2" />
      <div className="flex flex-col gap-6">
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-52 w-full" />
      </div>
    </div>
  )
}

function LaporError({ error, reset }: ErrorComponentProps) {
  const errorMessage =
    error instanceof Error ? error.message : 'Kendala jaringan atau sistem'

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16 text-center sm:px-6">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlertIcon className="size-6" />
      </div>
      <h2 className="text-xl font-bold text-foreground">
        Halaman Pelaporan Tidak Dapat Dimuat
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Terjadi kendala saat menyiapkan formulir pelaporan: {errorMessage}.
        Silakan muat ulang halaman atau periksa sambungan internet Anda.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button variant="outline" size="sm" onClick={() => reset()}>
          <RotateCcwIcon className="size-4" />
          Coba Lagi
        </Button>
        <Button variant="default" size="sm" render={<Link to="/" />}>
          Kembali ke Beranda
        </Button>
      </div>
    </div>
  )
}
