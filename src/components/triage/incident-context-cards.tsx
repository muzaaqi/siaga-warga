import { Link } from '@tanstack/react-router'
import {
  ExternalLinkIcon,
  LayersIcon,
  MapPinIcon,
  SatelliteIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type {
  NearbyClusterReport,
  NearbySatelliteHotspot,
} from '@/lib/schema/moderator'
import { formatRelativeTime } from '@/lib/utils'

interface IncidentContextCardsProps {
  latitude: number
  longitude: number
  addressDisplay: string | null
  nearbyClusterReports: Array<NearbyClusterReport>
  nearbySatelliteHotspots: Array<NearbySatelliteHotspot>
}

export function IncidentContextCards({
  latitude,
  longitude,
  addressDisplay,
  nearbyClusterReports,
  nearbySatelliteHotspots,
}: IncidentContextCardsProps) {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Kartu Geospasial & Navigasi Lapangan */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2 text-sm font-semibold sm:text-base">
              <MapPinIcon className="size-4 text-primary" />
              <span>Lokasi & Koordinat Presisi</span>
            </span>
          </CardTitle>
          <CardAction>
            <Button
              variant="outline"
              size="xs"
              render={
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                />
              }
            >
              <span>Buka Google Maps</span>
              <ExternalLinkIcon className="size-3" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 text-xs sm:text-sm">
            <div className="flex items-start gap-1.5 text-muted-foreground">
              <span className="font-medium text-foreground">Alamat:</span>
              <span>{addressDisplay || 'Tidak ada alamat tertera'}</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-muted-foreground">GPS Asli:</span>
              <span className="rounded bg-muted px-2 py-0.5 text-foreground">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Kartu Klaster Laporan Warga Sekitar (Radius 2 km) */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2 text-sm font-semibold sm:text-base">
              <LayersIcon className="size-4 text-blue-500" />
              <span>
                Klaster Laporan Warga Sekitar ({nearbyClusterReports.length})
              </span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nearbyClusterReports.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Tidak ada laporan warga lain terdeteksi dalam radius 2 km (Laporan
              tunggal).
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {nearbyClusterReports.map((cluster) => (
                <div
                  key={cluster.id}
                  className="flex items-center justify-between rounded-lg border border-border p-2.5 text-xs"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono font-semibold text-foreground">
                      {cluster.trackingCode}
                    </span>
                    <span className="text-muted-foreground">
                      Jarak ~{cluster.distanceMeters} m ({cluster.incidentType})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" size="xs">
                      {cluster.verificationStatus}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="xs"
                      render={
                        <Link
                          to="/admin/laporan/$id"
                          params={{ id: cluster.id }}
                        />
                      }
                    >
                      Buka
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Kartu Titik Panas Satelit NASA FIRMS (Radius 5 km) */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2 text-sm font-semibold sm:text-base">
              <SatelliteIcon className="size-4 text-amber-500" />
              <span>
                Korelasi Satelit NASA FIRMS ({nearbySatelliteHotspots.length})
              </span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nearbySatelliteHotspots.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Tidak ada anomali titik panas satelit terdeteksi dalam radius 5 km
              selama 24 jam terakhir.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {nearbySatelliteHotspots.map((hotspot) => (
                <div
                  key={hotspot.id}
                  className="flex items-center justify-between rounded-lg border border-border p-2.5 text-xs"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground">
                        {hotspot.source}
                      </span>
                      <Badge variant="secondary" size="xs">
                        Jarak {hotspot.distanceKm} km
                      </Badge>
                    </div>
                    <span className="text-muted-foreground">
                      Deteksi: {formatRelativeTime(hotspot.acquiredAt)}
                    </span>
                  </div>
                  {hotspot.brightness ? (
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {hotspot.brightness.toFixed(1)} K
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
