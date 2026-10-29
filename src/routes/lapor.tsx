import { createFileRoute, Link } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { RotateCcwIcon, ShieldAlertIcon } from 'lucide-react'
import { ReportForm } from '@/components/report/report-form'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/lapor')({
  head: () => ({
    meta: [
      {
        title: 'Laporkan Kebakaran | SiagaWarga',
      },
      {
        name: 'description',
        content:
          'Kirim foto dan titik lokasi kejadian kebakaran hutan atau permukiman. Laporan Anda langsung diverifikasi petugas untuk penanganan cepat.',
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
      {/* Header Halaman Utama (Rule 15 & DESIGN.md) */}
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          Laporkan Kebakaran
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Kirim foto dan titik lokasi kejadian. Laporan Anda langsung
          diverifikasi petugas untuk penanganan cepat.
        </p>
      </header>

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
