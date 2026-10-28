import * as React from 'react'
import { CheckIcon, FlameIcon, RotateCcwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  useMap,
} from '@/components/ui/map'
import {
  ResponsiveOverlay,
  ResponsiveOverlayContent,
} from '@/components/ui/responsive-overlay'

interface MapPinPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialLat: number
  initialLon: number
  onConfirmLocation: (lat: number, lon: number, addressHint?: string) => void
}

function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lon: number) => void
}) {
  const { map } = useMap()

  React.useEffect(() => {
    if (!map) return

    const handleClick = (e: { lngLat: { lng: number; lat: number } }) => {
      onLocationSelect(e.lngLat.lat, e.lngLat.lng)
    }

    map.on('click', handleClick)
    return () => {
      map.off('click', handleClick)
    }
  }, [map, onLocationSelect])

  return null
}

export function MapPinPicker({
  open,
  onOpenChange,
  initialLat,
  initialLon,
  onConfirmLocation,
}: MapPinPickerProps) {
  const [lat, setLat] = React.useState<number>(initialLat)
  const [lon, setLon] = React.useState<number>(initialLon)
  const [addressHint, setAddressHint] = React.useState<string>('')

  // Sinkronisasi koordinat awal saat modal dibuka
  React.useEffect(() => {
    if (open) {
      setLat(initialLat)
      setLon(initialLon)
    }
  }, [open, initialLat, initialLon])

  // Reset ke lokasi awal
  const handleResetLocation = () => {
    setLat(initialLat)
    setLon(initialLon)
  }

  // Terapkan koordinat manual
  const handleUpdateCoordinates = (newLat: number, newLon: number) => {
    setLat(Number(newLat.toFixed(6)))
    setLon(Number(newLon.toFixed(6)))
  }

  const handleConfirm = () => {
    onConfirmLocation(lat, lon, addressHint)
    onOpenChange(false)
  }

  return (
    <ResponsiveOverlay open={open} onOpenChange={onOpenChange}>
      <ResponsiveOverlayContent
        title="Tandai Titik Api di Peta"
        description="Klik pada peta atau geser pin penanda menuju lokasi kebakaran yang Anda amati."
        className="max-w-2xl"
      >
        <div className="flex flex-col gap-4">
          {/* Kontainer Peta mapcn (Rule: Give the map a height) */}
          <div className="relative h-80 w-full overflow-hidden rounded-lg border border-border bg-muted/40 sm:h-96">
            {open && (
              <Map center={[lon, lat]} zoom={12}>
                <MapControls showZoom showLocate position="top-right" />
                <MapClickHandler onLocationSelect={handleUpdateCoordinates} />
                <MapMarker
                  longitude={lon}
                  latitude={lat}
                  draggable
                  onDragEnd={(coords) => {
                    handleUpdateCoordinates(coords.lat, coords.lng)
                  }}
                >
                  <MarkerContent>
                    <div className="flex size-7 items-center justify-center rounded-full bg-[var(--color-ember)] text-white shadow-md ring-2 ring-white transition-transform hover:scale-110">
                      <FlameIcon className="size-4" />
                    </div>
                  </MarkerContent>
                  <MarkerTooltip>
                    Titik Api: {lat.toFixed(4)}, {lon.toFixed(4)}
                  </MarkerTooltip>
                </MapMarker>
              </Map>
            )}

            {/* Tombol Reset Lokasi */}
            <div className="absolute top-2 left-2 z-10">
              <Button
                type="button"
                variant="secondary"
                size="xs"
                onClick={handleResetLocation}
              >
                <RotateCcwIcon className="size-3" />
                Reset ke Posisi Awal
              </Button>
            </div>
          </div>

          {/* Form Koordinat Manual & Hint */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-muted-foreground">
                Latitude (Lintang)
              </span>
              <Input
                variant="mono"
                value={lat}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  if (!isNaN(val)) handleUpdateCoordinates(val, lon)
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-muted-foreground">
                Longitude (Bujur)
              </span>
              <Input
                variant="mono"
                value={lon}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  if (!isNaN(val)) handleUpdateCoordinates(lat, val)
                }}
              />
            </div>
          </div>

          {/* Catatan Patokan Alamat Opsional */}
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-medium text-muted-foreground">
              Patokan / Catatan Lokasi
            </span>
            <Input
              placeholder="Contoh: Belakang pabrik sawit, dekat sungai"
              value={addressHint}
              onChange={(e) => setAddressHint(e.target.value)}
            />
          </div>

          {/* Tombol Konfirmasi */}
          <div className="mt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="ember"
              size="sm"
              onClick={handleConfirm}
            >
              <CheckIcon className="size-4" />
              Terapkan Lokasi Ini
            </Button>
          </div>
        </div>
      </ResponsiveOverlayContent>
    </ResponsiveOverlay>
  )
}
