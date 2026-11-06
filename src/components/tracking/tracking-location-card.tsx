import {
  ExternalLinkIcon,
  FlameIcon,
  InfoIcon,
  MapPinIcon,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  MapControls,
} from '@/components/ui/map'
import type { MaskedLocation } from '@/lib/schema/tracking'

interface TrackingLocationCardProps {
  maskedLocation: MaskedLocation
  addressDisplay: string | null
}

export function TrackingLocationCard({
  maskedLocation,
  addressDisplay,
}: TrackingLocationCardProps) {
  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${maskedLocation.latitude},${maskedLocation.longitude}`

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <CardTitle>Perkiraan Lokasi Kejadian</CardTitle>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPinIcon className="size-3.5 shrink-0 text-primary" />
              <span className="font-medium text-foreground">
                {addressDisplay || 'Area terpetakan secara otomatis'}
              </span>
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            render={
              <a
                href={gmapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <ExternalLinkIcon className="size-3.5" />
            <span>Buka di Google Maps</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Peta Mini Tersamar MapLibre GL */}
          <div className="relative h-64 w-full overflow-hidden rounded-lg border border-border bg-muted/40 sm:h-72">
            <Map
              center={[maskedLocation.longitude, maskedLocation.latitude]}
              zoom={13}
              className="size-full"
            >
              <MapControls showZoom position="top-right" />
              <MapMarker
                longitude={maskedLocation.longitude}
                latitude={maskedLocation.latitude}
              >
                <MarkerContent>
                  <div className="relative flex size-10 items-center justify-center">
                    {/* Efek Radius Tersamar ~800m */}
                    <span className="absolute size-10 animate-ping rounded-full bg-[var(--color-ember)]/30" />
                    <div className="relative flex size-7 items-center justify-center rounded-full bg-[var(--color-ember)] text-white shadow-md ring-2 ring-white">
                      <FlameIcon className="size-4" />
                    </div>
                  </div>
                </MarkerContent>
                <MarkerTooltip>
                  Perkiraan Radius Insiden (~800m)
                </MarkerTooltip>
              </MapMarker>
            </Map>
          </div>

          {/* Rule 7: Penafian Privasi Spasial */}
          <Alert>
            <InfoIcon className="size-4 text-primary" />
            <AlertDescription>
              <strong className="text-foreground">Perlindungan Privasi:</strong>{' '}
              Koordinat titik kejadian pada tampilan publik disamarkan ke tingkat
              desa/kelurahan (radius ~800m) guna melindungi kerahasiaan alamat rumah
              warga pelapor.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  )
}
