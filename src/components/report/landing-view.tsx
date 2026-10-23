import * as React from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  FlameIcon,
  MapPinIcon,
  SearchIcon,
  ShieldCheckIcon,
  SatelliteIcon,
  CheckCircle2Icon,
  CompassIcon,
  WindIcon,
  EyeIcon,
  RadioIcon,
  ClockIcon,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { quickTrackingSchema } from '@/lib/schema'
import type { LandingStats } from '@/lib/schema'
import { cn } from '@/lib/utils'

interface LandingViewProps {
  stats: LandingStats
}

export function LandingView({ stats }: LandingViewProps) {
  const navigate = useNavigate()
  const [trackingCode, setTrackingCode] = React.useState('')
  const [trackingError, setTrackingError] = React.useState<string | null>(null)

  const handleQuickTrackingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTrackingError(null)

    const result = quickTrackingSchema.safeParse({ trackingCode })
    if (!result.success) {
      setTrackingError(
        result.error.issues[0]?.message ??
          'Format kode tidak valid. Contoh: SW-2026-X89B',
      )
      return
    }

    navigate({
      to: '/lacak/$code',
      params: { code: result.data.trackingCode },
    })
  }

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
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-8 sm:px-6 md:py-12">
      {/* 1. Hero Section */}
      <section className="max-w-4xl space-y-6">
        <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <RadioIcon className="size-3.5" aria-hidden="true" />
          <span>Sistem Informasi Tanggap Bencana Terbuka</span>
        </div>

        <h1 className="text-3xl leading-tight font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Platform Pemantauan & Verifikasi Laporan Kebakaran Terbuka
        </h1>

        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Melaporkan kebakaran hutan, lahan, dan permukiman secara transparan
          dengan validasi silang data satelit aktif NASA FIRMS serta
          perlindungan privasi pelapor demi percepatan penanganan darurat di
          Indonesia.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            to="/lapor"
            className={cn(buttonVariants({ variant: 'default', size: 'lg' }))}
          >
            <FlameIcon className="size-4" aria-hidden="true" />
            <span>Laporkan Kebakaran</span>
          </Link>

          <Link
            to="/pantau"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
          >
            <MapPinIcon className="size-4" aria-hidden="true" />
            <span>Pantau Peta Insiden</span>
          </Link>
        </div>

        {/* Quick Tracking Search Card */}
        <div className="max-w-xl pt-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <SearchIcon
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                  <span>Cek Status Laporan Cepat</span>
                </span>
              </CardTitle>
              <CardDescription>
                Lacak perkembangan penanganan insiden kebakaran menggunakan kode
                tiket unik Anda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleQuickTrackingSubmit}
                className="flex flex-col gap-2 sm:flex-row"
              >
                <div className="flex-1">
                  <label htmlFor="tracking-code-input" className="sr-only">
                    Kode Tiket Pelacakan
                  </label>
                  <Input
                    id="tracking-code-input"
                    variant="mono"
                    placeholder="Contoh: SW-2026-X89B"
                    value={trackingCode}
                    onChange={(e) => {
                      setTrackingCode(e.target.value)
                      if (trackingError) setTrackingError(null)
                    }}
                    aria-invalid={!!trackingError}
                    aria-describedby={
                      trackingError ? 'tracking-code-error' : undefined
                    }
                  />
                  {trackingError && (
                    <p
                      id="tracking-code-error"
                      className="mt-1.5 text-xs text-destructive"
                      role="alert"
                    >
                      {trackingError}
                    </p>
                  )}
                </div>
                <Button type="submit" variant="default" className="shrink-0">
                  <SearchIcon className="size-4" aria-hidden="true" />
                  <span>Lacak Status</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 2. Telemetry Strip (24-Hour Real-Time Snapshot) */}
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

      {/* 3. Prinsip Kejujuran Sistem (4-Layer Verification) */}
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

      {/* 4. Fitur Utama Platform */}
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

      {/* 5. Panduan Keselamatan Tanggap Api */}
      <section className="space-y-6">
        <div className="max-w-2xl">
          <Badge variant="destructive" className="mb-2">
            Protokol Keselamatan
          </Badge>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Panduan Keselamatan Warga di Lokasi Kebakaran
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Keselamatan jiwa adalah prioritas utama. Patuhi pedoman berikut saat
            berada di sekitar wilayah kebakaran.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                  <CompassIcon className="size-5" aria-hidden="true" />
                </span>
                <CardTitle>Jaga Jarak Aman</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Jaga jarak minimal 100 meter dari pusat api atau kobaran lahan
                gambut. Hindari berada di jalur rambatan api aktif yang mudah
                dipicu semak kering.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                  <WindIcon className="size-5" aria-hidden="true" />
                </span>
                <CardTitle>Perhatikan Arah Angin</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Evakuasikan diri ke arah berlawanan atau menyilang dari hembusan
                asap pekat. Gunakan masker basah atau kain penutup hidung untuk
                mencegah inhalasi asap beracun.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                  <EyeIcon className="size-5" aria-hidden="true" />
                </span>
                <CardTitle>Dokumentasi Terlindung</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Ambil foto bukti hanya dari lokasi yang stabil, tidak terancam
                api, dan memiliki jalur evakuasi terbuka. Jangan membahayakan
                diri demi mengambil gambar.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
