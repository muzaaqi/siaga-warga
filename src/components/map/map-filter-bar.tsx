import {
  CheckIcon,
  FlameIcon,
  LayersIcon,
  RadioIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MapFilterBarProps {
  incidentType: string
  onIncidentTypeChange: (val: string) => void
  timeRange: '24h' | '3d' | '7d'
  onTimeRangeChange: (val: '24h' | '3d' | '7d') => void
  showCitizenReports: boolean
  onToggleCitizenReports: (show: boolean) => void
  showSatelliteHotspots: boolean
  onToggleSatelliteHotspots: (show: boolean) => void
}

export function MapFilterBar({
  incidentType,
  onIncidentTypeChange,
  timeRange,
  onTimeRangeChange,
  showCitizenReports,
  onToggleCitizenReports,
  showSatelliteHotspots,
  onToggleSatelliteHotspots,
}: MapFilterBarProps) {
  const incidentOptions = [
    { id: 'all', label: 'Semua Kategori' },
    { id: 'karhutla', label: 'Karhutla' },
    { id: 'permukiman', label: 'Permukiman' },
    { id: 'industri', label: 'Industri' },
  ]

  const timeRangeOptions: Array<{ id: '24h' | '3d' | '7d'; label: string }> = [
    { id: '24h', label: '24 Jam' },
    { id: '3d', label: '3 Hari' },
    { id: '7d', label: '7 Hari' },
  ]

  return (
    <Card className="w-full">
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Baris 1: Sakelar Lapisan Peta (Dual-Layer Toggles) */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <LayersIcon className="size-3.5 text-primary" />
              <span>Lapisan Peta:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={showCitizenReports ? 'default' : 'outline'}
                size="sm"
                onClick={() => onToggleCitizenReports(!showCitizenReports)}
              >
                <FlameIcon className="size-3.5" />
                <span>Laporan Warga</span>
                {showCitizenReports && <CheckIcon className="size-3" />}
              </Button>

              <Button
                type="button"
                variant={showSatelliteHotspots ? 'default' : 'outline'}
                size="sm"
                onClick={() => onToggleSatelliteHotspots(!showSatelliteHotspots)}
              >
                <RadioIcon className="size-3.5" />
                <span>Satelit NASA FIRMS</span>
                {showSatelliteHotspots && <CheckIcon className="size-3" />}
              </Button>
            </div>
          </div>

          {/* Baris 2: Filter Rentang Waktu & Tipe Kebakaran */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Tipe Kebakaran */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-muted-foreground mr-1">
                Tipe:
              </span>
              {incidentOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onIncidentTypeChange(opt.id)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                    incidentType === opt.id
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Rentang Waktu */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-muted-foreground mr-1">
                Rentang:
              </span>
              <div className="inline-flex rounded-lg border border-border/80 bg-muted/40 p-0.5">
                {timeRangeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onTimeRangeChange(opt.id)}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                      timeRange === opt.id
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
