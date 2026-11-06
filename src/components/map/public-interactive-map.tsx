import { Link } from '@tanstack/react-router'
import {
  ExternalLinkIcon,
  FlameIcon,
  InfoIcon,
  RadioIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
  MapControls,
} from '@/components/ui/map'
import { formatRelativeTime } from '@/lib/utils'
import type {
  PublicMapReportItem,
  PublicMapHotspotItem,
} from '@/lib/schema/map'

interface PublicInteractiveMapProps {
  reports: Array<PublicMapReportItem>
  hotspots: Array<PublicMapHotspotItem>
  showCitizenReports: boolean
  showSatelliteHotspots: boolean
}

export function PublicInteractiveMap({
  reports,
  hotspots,
  showCitizenReports,
  showSatelliteHotspots,
}: PublicInteractiveMapProps) {
  // Koordinat tengah kepulauan Indonesia
  const defaultCenter: [number, number] = [118.0149, -2.5489]

  const handlingLabels: Record<string, string> = {
    not_forwarded: 'Belum Diteruskan',
    forwarded: 'Diteruskan ke Damkar/BPBD',
    acknowledged: 'Terkonfirmasi Instansi',
    in_progress: 'Operasi Pemadaman',
    resolved: 'Selesai / Teratasi',
    unknown: 'Status Belum Diketahui',
  }

  const handlingBadgeVariant = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'success' as const
      case 'in_progress':
      case 'forwarded':
      case 'acknowledged':
        return 'warning' as const
      default:
        return 'secondary' as const
    }
  }

  return (
    <Card className="w-full">
      <CardContent>
        <div className="space-y-3">
          {/* Kontainer Utama Peta MapLibre GL */}
          <div className="relative h-[480px] w-full overflow-hidden rounded-xl border border-border bg-muted/40 sm:h-[560px]">
            <Map center={defaultCenter} zoom={4.8} className="size-full">
              <MapControls showZoom position="top-right" />

              {/* 1. Layer Laporan Warga Terverifikasi (Ember Flame Markers) */}
              {showCitizenReports &&
                reports.map((report) => (
                  <MapMarker
                    key={report.id}
                    longitude={report.longitude}
                    latitude={report.latitude}
                  >
                    <MarkerContent>
                      <div className="relative flex size-8 items-center justify-center cursor-pointer">
                        {report.handlingStatus === 'in_progress' && (
                          <span className="absolute size-8 animate-ping rounded-full bg-[var(--color-ember)]/40" />
                        )}
                        <div className="relative flex size-7 items-center justify-center rounded-full bg-[var(--color-ember)] text-white shadow-md ring-2 ring-white transition-transform hover:scale-115">
                          <FlameIcon className="size-4" />
                        </div>
                      </div>
                    </MarkerContent>

                    <MarkerTooltip>
                      {report.trackingCode} &bull; {report.incidentType}
                    </MarkerTooltip>

                    <MarkerPopup closeButton>
                      <div className="w-64 space-y-2 p-1 text-xs">
                        <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                          <span className="font-mono font-bold text-foreground">
                            {report.trackingCode}
                          </span>
                          <Badge
                            variant={handlingBadgeVariant(report.handlingStatus)}
                            size="xs"
                          >
                            <span>
                              {handlingLabels[report.handlingStatus] ||
                                report.handlingStatus}
                            </span>
                          </Badge>
                        </div>

                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {report.description}
                        </p>

                        <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                          <span>{formatRelativeTime(report.submittedAtIso)}</span>
                          <span className="text-primary font-medium">
                            ~800m tersamar
                          </span>
                        </div>

                        <div className="pt-1">
                          <Button
                            size="xs"
                            render={
                              <Link
                                to="/lacak/$code"
                                params={{ code: report.trackingCode }}
                              />
                            }
                            className="w-full"
                          >
                            <ExternalLinkIcon className="size-3" />
                            <span>Lacak Penanganan Ini</span>
                          </Button>
                        </div>
                      </div>
                    </MarkerPopup>
                  </MapMarker>
                ))}

              {/* 2. Layer Titik Panas Satelit NASA FIRMS (Orange Hotspots) */}
              {showSatelliteHotspots &&
                hotspots.map((hotspot) => (
                  <MapMarker
                    key={hotspot.id}
                    longitude={hotspot.longitude}
                    latitude={hotspot.latitude}
                  >
                    <MarkerContent>
                      <div className="flex size-4.5 items-center justify-center rounded-full bg-amber-600/90 text-white shadow-xs ring-1 ring-white/90 transition-transform hover:scale-125">
                        <RadioIcon className="size-2.5" />
                      </div>
                    </MarkerContent>

                    <MarkerTooltip>
                      NASA FIRMS ({hotspot.source}) &bull;{' '}
                      {hotspot.brightness ? `${hotspot.brightness} K` : 'Hotspot'}
                    </MarkerTooltip>

                    <MarkerPopup closeButton>
                      <div className="w-56 space-y-1.5 p-1 text-xs">
                        <div className="flex items-center justify-between border-b border-border/60 pb-1">
                          <span className="font-semibold text-foreground">
                            Satelit {hotspot.source}
                          </span>
                          <Badge variant="outline" size="xs">
                            <span>NASA NRT</span>
                          </Badge>
                        </div>

                        <div className="space-y-0.5 text-[11px] text-muted-foreground">
                          <p>
                            <strong className="text-foreground">Suhu Kecerahan:</strong>{' '}
                            {hotspot.brightness ? `${hotspot.brightness} Kelvin` : 'N/A'}
                          </p>
                          <p>
                            <strong className="text-foreground">Keyakinan:</strong>{' '}
                            {hotspot.confidence || 'nominal'}
                          </p>
                          <p>
                            <strong className="text-foreground">Waktu Deteksi:</strong>{' '}
                            {formatRelativeTime(hotspot.acquiredAtIso)}
                          </p>
                        </div>

                        <p className="border-t border-border/50 pt-1 text-[10px] text-muted-foreground/80 italic">
                          Deteksi sensor termal inframerah satelit cuaca NASA.
                        </p>
                      </div>
                    </MarkerPopup>
                  </MapMarker>
                ))}
            </Map>
          </div>

          {/* Penafian Privasi Spasial (Rule 7) */}
          <Alert>
            <InfoIcon className="size-4 text-primary" />
            <AlertDescription>
              <strong className="text-foreground">Perlindungan Privasi:</strong>{' '}
              Titik laporan warga disamarkan ke tingkat desa/kelurahan (radius ~800m)
              guna melindungi kerahasiaan tempat tinggal pelapor. Titik satelit NASA
              bersumber dari sensor VIIRS/MODIS dengan jeda pembaruan 6 jam.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  )
}
