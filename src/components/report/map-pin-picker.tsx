import * as React from 'react'
import { CheckIcon, RotateCcwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export function MapPinPicker({
  open,
  onOpenChange,
  initialLat,
  initialLon,
  onConfirmLocation,
}: MapPinPickerProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null)
  const mapInstanceRef = React.useRef<any>(null)
  const markerRef = React.useRef<any>(null)

  const [lat, setLat] = React.useState<number>(initialLat)
  const [lon, setLon] = React.useState<number>(initialLon)
  const [addressHint, setAddressHint] = React.useState<string>('')
  const [mapLoaded, setMapLoaded] = React.useState<boolean>(false)

  // Sinkronisasi koordinat awal saat modal dibuka
  React.useEffect(() => {
    if (open) {
      setLat(initialLat)
      setLon(initialLon)
    }
  }, [open, initialLat, initialLon])

  // Inisialisasi MapLibre saat modal terbuka
  React.useEffect(() => {
    let map: any = null
    let marker: any = null

    if (!open || !mapContainerRef.current) return

    let isMounted = true

    async function initMap() {
      try {
        const maplibre = await import('maplibre-gl')

        if (!isMounted || !mapContainerRef.current) return

        map = new maplibre.Map({
          container: mapContainerRef.current,
          style: {
            version: 8,
            sources: {
              'osm-tiles': {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors',
              },
            },
            layers: [
              {
                id: 'osm-layer',
                type: 'raster',
                source: 'osm-tiles',
                minzoom: 0,
                maxzoom: 19,
              },
            ],
          },
          center: [lon, lat],
          zoom: 12,
        })

        marker = new maplibre.Marker({ draggable: true, color: '#f05a28' })
          .setLngLat([lon, lat])
          .addTo(map)

        marker.on('dragend', () => {
          const lngLat = marker.getLngLat()
          if (isMounted) {
            setLat(Number(lngLat.lat.toFixed(6)))
            setLon(Number(lngLat.lng.toFixed(6)))
          }
        })

        map.on('click', (e: any) => {
          marker.setLngLat(e.lngLat)
          if (isMounted) {
            setLat(Number(e.lngLat.lat.toFixed(6)))
            setLon(Number(e.lngLat.lng.toFixed(6)))
          }
        })

        mapInstanceRef.current = map
        markerRef.current = marker

        map.on('load', () => {
          if (isMounted) setMapLoaded(true)
        })
      } catch (err) {
        console.error('Gagal menginisialisasi MapLibre GL:', err)
      }
    }

    initMap()

    return () => {
      isMounted = false
      if (marker) marker.remove()
      if (map) map.remove()
      mapInstanceRef.current = null
      markerRef.current = null
      setMapLoaded(false)
    }
  }, [open])

  // Reset ke lokasi awal
  const handleResetLocation = () => {
    setLat(initialLat)
    setLon(initialLon)
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo({
        center: [initialLon, initialLat],
        zoom: 12,
      })
      markerRef.current.setLngLat([initialLon, initialLat])
    }
  }

  // Terapkan koordinat manual
  const handleUpdateCoordinates = (newLat: number, newLon: number) => {
    setLat(newLat)
    setLon(newLon)
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo({ center: [newLon, newLat], zoom: 14 })
      markerRef.current.setLngLat([newLon, newLat])
    }
  }

  const handleConfirm = () => {
    onConfirmLocation(lat, lon, addressHint)
    onOpenChange(false)
  }

  return (
    <ResponsiveOverlay open={open} onOpenChange={onOpenChange}>
      <ResponsiveOverlayContent
        title="Tandai Titik Kejadian di Peta"
        description="Geser penanda peta atau klik langsung pada titik kebakaran untuk memperbarui koordinat secara presisi."
        className="max-w-xl"
      >
        <div className="flex flex-col gap-3">
          {/* Wadah Peta MapLibre */}
          <div className="relative h-64 w-full overflow-hidden rounded-md border border-border bg-muted/40">
            <div ref={mapContainerRef} className="size-full" />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/70 text-xs text-muted-foreground">
                Memuat peta satelit dan jalan...
              </div>
            )}
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-card/90 p-1 shadow-xs backdrop-blur-xs">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleResetLocation}
                title="Kembalikan ke posisi awal"
              >
                <RotateCcwIcon className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Baris Koordinat & Validasi */}
          <div className="grid grid-cols-2 gap-2 text-xs">
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
              Tetapkan Titik Lokasi
            </Button>
          </div>
        </div>
      </ResponsiveOverlayContent>
    </ResponsiveOverlay>
  )
}
