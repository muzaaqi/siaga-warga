import * as React from 'react'
import { FlameIcon, RotateCcwIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
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

export interface MapPinPickerProps {
  latitude: number
  longitude: number
  initialLat?: number
  initialLon?: number
  onChangeLocation: (lat: number, lon: number) => void
  disabled?: boolean
  className?: string
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

function MapCenterSync({ lat, lon }: { lat: number; lon: number }) {
  const { map } = useMap()
  const prevCoordsRef = React.useRef({ lat, lon })

  React.useEffect(() => {
    if (!map) return
    const diffLat = Math.abs(prevCoordsRef.current.lat - lat)
    const diffLon = Math.abs(prevCoordsRef.current.lon - lon)
    if (diffLat > 0.0001 || diffLon > 0.0001) {
      prevCoordsRef.current = { lat, lon }
      map.flyTo({
        center: [lon, lat],
        zoom: Math.max(map.getZoom(), 12),
        duration: 800,
      })
    }
  }, [map, lat, lon])

  return null
}

export function MapPinPicker({
  latitude,
  longitude,
  initialLat,
  initialLon,
  onChangeLocation,
  disabled = false,
  className,
}: MapPinPickerProps) {
  const handleUpdateCoordinates = (newLat: number, newLon: number) => {
    const roundedLat = Number(newLat.toFixed(6))
    const roundedLon = Number(newLon.toFixed(6))
    onChangeLocation(roundedLat, roundedLon)
  }

  const handleResetLocation = () => {
    if (initialLat !== undefined && initialLon !== undefined) {
      handleUpdateCoordinates(initialLat, initialLon)
    }
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Kontainer Peta mapcn Langsung (Inline Map) */}
      <div className="relative h-72 w-full overflow-hidden rounded-xl border border-border bg-muted/40 shadow-xs sm:h-84">
        <Map center={[longitude, latitude]} zoom={12} className="size-full">
          <MapControls
            showZoom
            showLocate
            position="top-right"
            onLocate={(coords) => {
              handleUpdateCoordinates(coords.latitude, coords.longitude)
            }}
          />
          <MapClickHandler onLocationSelect={handleUpdateCoordinates} />
          <MapCenterSync lat={latitude} lon={longitude} />
          <MapMarker
            longitude={longitude}
            latitude={latitude}
            draggable={!disabled}
            onDragEnd={(coords) => {
              handleUpdateCoordinates(coords.lat, coords.lng)
            }}
          >
            <MarkerContent>
              <div className="flex size-8 items-center justify-center rounded-full bg-[var(--color-ember)] text-white shadow-lg ring-2 ring-white transition-transform hover:scale-110">
                <FlameIcon className="size-4.5" />
              </div>
            </MarkerContent>
            <MarkerTooltip>
              Titik Api: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </MarkerTooltip>
          </MapMarker>
        </Map>

        {/* Overlay Informasi Koordinat di Peta */}
        <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex flex-col gap-1.5">
          <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-border bg-background/90 px-3 py-1.5 text-xs shadow-md backdrop-blur-md">
            <div className="size-2 animate-pulse rounded-full bg-[var(--color-ember)]" />
            <span className="font-medium text-foreground">Titik Api:</span>
            <span className="font-mono font-semibold text-foreground">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </span>
          </div>
        </div>

        {/* Tombol Reset ke Lokasi Awal */}
        {initialLat !== undefined && initialLon !== undefined && (
          <div className="absolute top-2 left-2 z-10">
            <Button
              type="button"
              variant="secondary"
              size="xs"
              onClick={handleResetLocation}
              disabled={disabled}
            >
              <RotateCcwIcon className="size-3" />
              Reset Posisi
            </Button>
          </div>
        )}
      </div>

      {/* Input Koordinat Manual untuk Presisi atau Verifikasi */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-muted-foreground">
            Latitude (Lintang)
          </span>
          <Input
            variant="mono"
            value={latitude}
            disabled={disabled}
            onChange={(e) => {
              const val = parseFloat(e.target.value)
              if (!isNaN(val)) handleUpdateCoordinates(val, longitude)
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-medium text-muted-foreground">
            Longitude (Bujur)
          </span>
          <Input
            variant="mono"
            value={longitude}
            disabled={disabled}
            onChange={(e) => {
              const val = parseFloat(e.target.value)
              if (!isNaN(val)) handleUpdateCoordinates(latitude, val)
            }}
          />
        </div>
      </div>
    </div>
  )
}
