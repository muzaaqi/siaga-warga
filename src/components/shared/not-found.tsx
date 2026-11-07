import * as React from 'react'
import { Link } from '@tanstack/react-router'
import {
  FlameIcon,
  HomeIcon,
  MapIcon,
  PhoneCallIcon,
  SearchIcon,
  SearchXIcon,
  ShieldAlertIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { getReportTrackingInputSchema } from '@/lib/schema/tracking'

export interface NotFoundProps {
  title?: string
  description?: string
  showSearch?: boolean
  data?: unknown
  isNotFound?: boolean
  routeId?: string
}

export function NotFound({
  title = 'Halaman Tidak Ditemukan',
  description = 'Tautan yang Anda tuju mungkin sudah dipindahkan, dihapus, atau alamat URL salah ketik. Seluruh layanan pemantauan dan pelaporan kebakaran SiagaWarga tetap aktif.',
  showSearch = true,
}: NotFoundProps) {
  const [trackingCodeInput, setTrackingCodeInput] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState('')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validation = getReportTrackingInputSchema.safeParse({
      trackingCode: trackingCodeInput,
    })

    if (!validation.success) {
      setErrorMessage(
        'Format kode pelacakan tidak valid. Gunakan format resmi, contoh: SW-2026-X89B.',
      )
      return
    }

    setErrorMessage('')
    if (typeof window !== 'undefined') {
      window.location.assign(
        `/lacak/${encodeURIComponent(validation.data.trackingCode)}`,
      )
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <Card size="lg" className="w-full text-center">
        <CardHeader className="flex flex-col items-center">
          {/* Tactical 404 Status Icon */}
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground ring-1 ring-border">
            <SearchXIcon className="size-7 text-[var(--color-ember)]" />
          </div>

          <Badge variant="outline">
            404 NOT FOUND
          </Badge>

          <CardTitle size="xl">{title}</CardTitle>
          <CardDescription className="max-w-xl text-center">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Matriks Navigasi Cepat (Quick Action Matrix) */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="default"
                render={<Link to="/" />}
              >
                <HomeIcon className="size-4" />
                <span>Kembali ke Beranda</span>
              </Button>

              <Button
                variant="outline"
                render={<Link to="/pantau" />}
              >
                <MapIcon className="size-4" />
                <span>Buka Peta Pantau</span>
              </Button>

              <Button
                variant="outline"
                render={<Link to="/lapor" />}
              >
                <FlameIcon className="size-4 text-[var(--color-ember)]" />
                <span>Laporkan Titik Api</span>
              </Button>
            </div>

            <Separator />

            {/* Kolom Pencarian Pelacakan Cepat */}
            {showSearch && (
              <div className="mx-auto max-w-md space-y-3 text-left">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Cari Status Laporan Kebakaran
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Jika Anda mencari status tiket laporan, masukkan kode resmi di bawah ini:
                  </p>
                </div>

                <form onSubmit={handleSearchSubmit} className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      variant="mono"
                      type="text"
                      value={trackingCodeInput}
                      onChange={(e) => {
                        setTrackingCodeInput(e.target.value)
                        if (errorMessage) setErrorMessage('')
                      }}
                      placeholder="Contoh: SW-2026-X89B"
                    />
                    <Button type="submit" variant="secondary">
                      <SearchIcon className="size-4" />
                      <span>Lacak Laporan</span>
                    </Button>
                  </div>

                  {errorMessage && (
                    <p className="text-xs font-medium text-destructive">
                      {errorMessage}
                    </p>
                  )}
                </form>
              </div>
            )}

            {/* Kartu Informasi Layanan Darurat 112 & 113 */}
            <Alert>
              <ShieldAlertIcon className="size-4 text-[var(--color-ember)]" />
              <AlertDescription>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-left">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">
                      Butuh Bantuan Pemadaman Segera?
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hubungi Pemadam Kebakaran di 113 atau Layanan Kedaruratan Bebas Pulsa 112 jika berada di dekat api.
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      size="xs"
                      variant="destructive"
                      render={<a href="tel:113" />}
                    >
                      <PhoneCallIcon className="size-3" />
                      <span>Damkar 113</span>
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      render={<a href="tel:112" />}
                    >
                      <PhoneCallIcon className="size-3" />
                      <span>Darurat 112</span>
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
