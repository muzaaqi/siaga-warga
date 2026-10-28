import * as React from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowRightIcon,
  ShieldCheckIcon,
  SatelliteIcon,
  CheckCircle2Icon,
  ClockIcon,
  SearchIcon,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { LandingStats } from '@/lib/schema'
import { cn } from '@/lib/utils'
import { FloatingQuickTracking } from './floating-quick-tracking'
import { SafetyGuidelines } from './safety-guidelines'

interface LandingViewProps {
  stats: LandingStats
}

export function LandingView({ stats }: LandingViewProps) {
  // Format timestamp WIB
  const formattedTime = React.useMemo(() => {
    try {
      const date = new Date(stats.lastUpdatedIso)
      return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Jakarta',
      }).format(date)
    } catch {
      return stats.lastUpdatedIso
    }
  }, [stats.lastUpdatedIso])

  return (
    <div className="mx-auto max-w-7xl space-y-20 px-4 py-8 sm:px-6 md:py-12">
      {/* 1. Hero Section (Asymmetric Editorial Layout) */}
      <section className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="space-y-6 lg:col-span-7">
          <h1 className="text-3xl leading-[1.15] font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-[3.25rem]">
            Pantau dan Verifikasi Laporan{' '}
            <span className="text-primary">Kebakaran</span>
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Laporkan kebakaran hutan, lahan, atau permukiman dengan mudah dan
            aman. SiagaWarga membantu memeriksa laporan melalui validasi lokasi,
            data hotspot satelit, dan verifikasi moderator, serta menyediakan
            pelacakan status laporan secara transparan.
          </p>

          <div className="pt-2">
            <Link
              to="/lapor"
              className={cn(
                buttonVariants({ variant: 'default', size: 'lg' }),
                'group h-12 rounded-xl px-7 text-base font-semibold shadow-md',
              )}
            >
              <span>Lapor Kebakaran</span>
              <ArrowRightIcon
                className="size-4.5 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        {/* Hero Photo with Organic Asymmetric Curve */}
        <div className="relative lg:col-span-5">
          <div className="relative mx-auto aspect-4/3 w-full max-w-lg overflow-hidden rounded-3xl border border-border/60 shadow-2xl lg:aspect-square lg:rounded-[2.5rem]">
            <img
              src="/images/hero-fire.webp"
              alt="Petugas menangani kobaran api kebakaran hutan"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            {/* Subtle Gradient Overlay for Depth */}
            <div className="absolute inset-0 bg-linear-to-tr from-black/40 via-transparent to-transparent" />

            {/* Lens Inspection Badge */}
            <div className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white shadow-lg backdrop-blur-md">
              <SearchIcon className="size-5" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Floating Quick Tracking Card (Overlapping Bridge) */}
      <FloatingQuickTracking />

      {/* 3. Telemetry Strip (24-Hour Real-Time Snapshot) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Ringkasan Data Insiden Terbuka
            </h2>
            <p className="text-xs text-muted-foreground">
              Data telemetri agregat 24 jam terakhir dari pelaporan publik dan
              pantauan sensor satelit.
            </p>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
            <ClockIcon className="size-3.5" aria-hidden="true" />
            <span>Pembaruan: {formattedTime} WIB</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Card 1: Laporan Masuk */}
          <Card size="sm">
            <CardHeader>
              <CardDescription>Laporan Masuk (24 Jam)</CardDescription>
              <CardAction>
                <Badge variant="outline" size="xs">
                  Warga
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-2xl font-extrabold text-foreground sm:text-3xl">
                {stats.activeReports24h}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Laporan masyarakat yang diterima sistem
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Terverifikasi Lapangan */}
          <Card size="sm">
            <CardHeader>
              <CardDescription>Terverifikasi Lapangan</CardDescription>
              <CardAction>
                <Badge variant="success" size="xs">
                  Valid
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-2xl font-extrabold text-[var(--success)] sm:text-3xl">
                {stats.verifiedReports}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Bukti foto telah diverifikasi moderator
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Hotspot Satelit */}
          <Card size="sm">
            <CardHeader>
              <CardDescription>Titik Panas Satelit</CardDescription>
              <CardAction>
                <Badge variant="warning" size="xs">
                  NASA FIRMS
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-2xl font-extrabold text-[var(--warning)] sm:text-3xl">
                {stats.activeHotspots}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Deteksi sensor VIIRS & MODIS
              </p>
            </CardContent>
          </Card>

          {/* Card 4: Penanganan Instansi */}
          <Card size="sm">
            <CardHeader>
              <CardDescription>Penanganan Instansi</CardDescription>
              <CardAction>
                <Badge variant="info" size="xs">
                  Damkar / BPBD
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-2xl font-extrabold text-[var(--info)] sm:text-3xl">
                {stats.handledIncidents}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Sedang atau telah dipadamkan petugas
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. Seksi Panduan Keselamatan Warga di Lokasi Kebakaran */}
      <SafetyGuidelines />

      {/* 5. Prinsip Kejujuran Sistem (4-Layer Verification) */}
      <section className="space-y-6">
        <div className="max-w-2xl">
          <Badge variant="outline" className="mb-2">
            Integritas Data
          </Badge>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Prinsip Kejujuran Sistem (System Honesty)
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            SiagaWarga memisahkan validasi bukti, konfirmasi lapangan, dan
            tindakan fisik instansi agar setiap tahap dapat diaudit secara jujur
            dan transparan.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Fase 1 */}
          <Card>
            <CardHeader>
              <div className="mb-2 flex items-center justify-between">
                <span className="flex size-8 items-center justify-center rounded-md bg-muted text-xs font-bold text-foreground">
                  01
                </span>
                <Badge variant="outline">Input Warga</Badge>
              </div>
              <CardTitle>Laporan Warga & Foto Wajib</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Laporan masuk dari warga dengan bukti foto asli langsung dari
                kamera dan koordinat geolokasi. Foto wajib diunggah untuk
                mengeliminasi laporan palsu.
              </p>
            </CardContent>
          </Card>

          {/* Fase 2 */}
          <Card>
            <CardHeader>
              <div className="mb-2 flex items-center justify-between">
                <span className="flex size-8 items-center justify-center rounded-md bg-muted text-xs font-bold text-foreground">
                  02
                </span>
                <Badge variant="warning">PostGIS</Badge>
              </div>
              <CardTitle>Deduplikasi Spasial</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Algoritma spasial mengelompokkan laporan dalam radius 2 km dan
                rentang 4 jam menjadi satu klaster insiden. Laporan ganda
                dijadikan bukti penguat tanpa membebani sistem.
              </p>
            </CardContent>
          </Card>

          {/* Fase 3 */}
          <Card>
            <CardHeader>
              <div className="mb-2 flex items-center justify-between">
                <span className="flex size-8 items-center justify-center rounded-md bg-muted text-xs font-bold text-foreground">
                  03
                </span>
                <Badge variant="success">Moderator</Badge>
              </div>
              <CardTitle>Verifikasi Manusia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Moderator terlatih meninjau keabsahan foto, metadata EXIF, dan
                kesesuaian visual kebakaran sebelum status ditingkatkan menjadi
                terverifikasi lapangan.
              </p>
            </CardContent>
          </Card>

          {/* Fase 4 */}
          <Card>
            <CardHeader>
              <div className="mb-2 flex items-center justify-between">
                <span className="flex size-8 items-center justify-center rounded-md bg-muted text-xs font-bold text-foreground">
                  04
                </span>
                <Badge variant="info">Instansi</Badge>
              </div>
              <CardTitle>Konfirmasi Penanganan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Status fisik pemadaman dicatat secara terpisah berdasarkan
                informasi resmi dari petugas pemadam kebakaran (Damkar) atau
                BPBD di lapangan hingga status selesai.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 6. Fitur Utama Platform */}
      <section className="space-y-6">
        <div className="max-w-2xl">
          <Badge variant="outline" className="mb-2">
            Kapabilitas Sistem
          </Badge>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Solusi Pemantauan Bencana Berbasis Data Terbuka
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Dibangun dengan standar keamanan modern untuk memberikan
            perlindungan maksimal kepada warga pelapor dan petugas.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <ShieldCheckIcon className="size-5" aria-hidden="true" />
              </div>
              <CardTitle>Privasi Tanpa Kompromi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Nomor kontak warga disimpan aman dan dienkripsi. Koordinat
                permukiman warga disamarkan hingga tingkat kelurahan pada peta
                publik untuk mencegah intimidasi dan penyalahgunaan data
                pribadi.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-[var(--warning)]/10 text-[var(--warning)]">
                <SatelliteIcon className="size-5" aria-hidden="true" />
              </div>
              <CardTitle>Satelit NASA FIRMS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Integrasi otomatis dengan sensor satelit VIIRS dan MODIS dalam
                radius 5 km. Sistem melakukan caching berkala selama 6 jam untuk
                menjaga keandalan data dan kuota layanan.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-[var(--success)]/10 text-[var(--success)]">
                <CheckCircle2Icon className="size-5" aria-hidden="true" />
              </div>
              <CardTitle>Audit Status Transparan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Setiap laporan memiliki halaman pelacakan publik yang memuat
                riwayat status lengkap beserta catatan alasan dari moderator,
                menciptakan akuntabilitas layanan publik.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
