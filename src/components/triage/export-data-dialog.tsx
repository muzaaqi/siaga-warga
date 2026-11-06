import * as React from 'react'
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  DownloadIcon,
  FileSpreadsheetIcon,
  MapIcon,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { FieldLabel } from '@/components/ui/field'
import {
  ResponsiveOverlay,
  ResponsiveOverlayContent,
} from '@/components/ui/responsive-overlay'
import { Spinner } from '@/components/ui/spinner'
import type { ExportFormat, ExportTimeRange } from '@/lib/schema/export'
import { exportIncidentData } from '@/server/functions/export'

interface ExportDataDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportDataDialog({ open, onOpenChange }: ExportDataDialogProps) {
  const [format, setFormat] = React.useState<ExportFormat>('csv')
  const [verificationStatus, setVerificationStatus] =
    React.useState<string>('verified')
  const [incidentType, setIncidentType] = React.useState<string>('all')
  const [timeRange, setTimeRange] = React.useState<ExportTimeRange>('7d')
  const [isDownloading, setIsDownloading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [downloadSuccessMessage, setDownloadSuccessMessage] = React.useState<
    string | null
  >(null)

  const statusOptions = [
    { value: 'verified', label: 'Terverifikasi Saja' },
    { value: 'all', label: 'Semua Status' },
    { value: 'pending', label: 'Menunggu' },
    { value: 'needs_review', label: 'Perlu Tinjauan' },
  ]

  const timeRangeOptions: Array<{ value: ExportTimeRange; label: string }> = [
    { value: '24h', label: '24 Jam Terakhir' },
    { value: '7d', label: '7 Hari Terakhir' },
    { value: '30d', label: '30 Hari Terakhir' },
    { value: 'all', label: 'Semua Waktu' },
  ]

  const incidentTypeOptions = [
    { value: 'all', label: 'Semua Insiden' },
    { value: 'karhutla', label: 'Karhutla' },
    { value: 'permukiman', label: 'Permukiman' },
  ]

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsDownloading(true)
    setErrorMessage(null)
    setDownloadSuccessMessage(null)

    try {
      const res = await exportIncidentData({
        data: {
          format,
          verificationStatus: verificationStatus as any,
          incidentType: incidentType as any,
          timeRange,
          limit: 1000,
        },
      })

      if (res.totalRows === 0) {
        setErrorMessage(
          'Tidak ada data insiden yang sesuai dengan kriteria filter ekspor saat ini.',
        )
        setIsDownloading(false)
        return
      }

      // Trigger unduhan berkas langsung di peramban
      const blob = new Blob([res.content], { type: res.mimeType })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = res.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setDownloadSuccessMessage(
        `Berhasil mengunduh ${res.totalRows} baris data (${res.filename}).`,
      )
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Terjadi kendala saat mengekspor data insiden.'
      setErrorMessage(msg)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <ResponsiveOverlay open={open} onOpenChange={onOpenChange}>
      <ResponsiveOverlayContent
        title="Ekspor Rekapitulasi Data Insiden"
        description="Unduh data laporan insiden kebakaran terverifikasi untuk kebutuhan pelaporan instansi Damkar atau integrasi sistem GIS Pusdalops BPBD."
      >
        <form onSubmit={handleDownload} className="flex flex-col gap-5 pt-2">
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertCircleIcon className="size-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {downloadSuccessMessage ? (
            <Alert variant="success">
              <CheckCircle2Icon className="size-4" />
              <AlertDescription>
                {downloadSuccessMessage}
              </AlertDescription>
            </Alert>
          ) : null}

          {/* Bagian 1: Pemilihan Format Berkas */}
          <div className="flex flex-col gap-2">
            <FieldLabel>Pilih Format Berkas</FieldLabel>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setFormat('csv')
                  setErrorMessage(null)
                }}
                className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                  format === 'csv'
                    ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                    : 'border-border/60 bg-card text-foreground hover:bg-muted/50'
                }`}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <FileSpreadsheetIcon className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold">Tabel CSV</span>
                    {format === 'csv' ? (
                      <span className="text-[10px] font-medium text-primary">
                        Terpilih
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Kompatibel dengan Excel, Google Sheets, dan arsip dinas.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormat('geojson')
                  setErrorMessage(null)
                }}
                className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                  format === 'geojson'
                    ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                    : 'border-border/60 bg-card text-foreground hover:bg-muted/50'
                }`}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <MapIcon className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold">
                      Spasial GeoJSON
                    </span>
                    {format === 'geojson' ? (
                      <span className="text-[10px] font-medium text-primary">
                        Terpilih
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Format vektor WGS 84 untuk QGIS, ArcGIS, dan WebGIS dinas.
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Bagian 2: Filter Status Verifikasi */}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Status Verifikasi</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {statusOptions.map((opt) => {
                const isActive = verificationStatus === opt.value
                return (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setVerificationStatus(opt.value)
                      setErrorMessage(null)
                    }}
                  >
                    {opt.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Bagian 3: Filter Rentang Waktu */}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Rentang Waktu</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {timeRangeOptions.map((opt) => {
                const isActive = timeRange === opt.value
                return (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setTimeRange(opt.value)
                      setErrorMessage(null)
                    }}
                  >
                    {opt.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Bagian 4: Filter Jenis Insiden */}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Kategori Insiden</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {incidentTypeOptions.map((opt) => {
                const isActive = incidentType === opt.value
                return (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setIncidentType(opt.value)
                      setErrorMessage(null)
                    }}
                  >
                    {opt.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Catatan Privasi & Perlindungan Saksi */}
          <div className="rounded-lg bg-muted/50 p-2.5 text-[11px] text-muted-foreground">
            Perhatian: Data pelapor yang memilih opsi anonim disamarkan secara
            otomatis menjadi &ldquo;Warga Anonim&rdquo; demi mematuhi standar
            perlindungan saksi masyarakat.
          </div>

          {/* Tombol Aksi */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isDownloading}
            >
              Tutup
            </Button>
            <Button type="submit" disabled={isDownloading}>
              {isDownloading ? (
                <>
                  <Spinner className="size-4" />
                  <span>Memproses Berkas...</span>
                </>
              ) : (
                <>
                  <DownloadIcon className="size-4" />
                  <span>
                    Unduh Berkas {format === 'csv' ? 'CSV' : 'GeoJSON'}
                  </span>
                </>
              )}
            </Button>
          </div>
        </form>
      </ResponsiveOverlayContent>
    </ResponsiveOverlay>
  )
}
