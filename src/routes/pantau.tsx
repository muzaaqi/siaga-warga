import * as React from 'react'
import {
  createFileRoute,
  useRouter,
  Link,
} from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  MapPinIcon,
  RotateCcwIcon,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getPublicMapData } from '@/server/functions/map'
import { MapTelemetryHeader } from '@/components/map/map-telemetry-header'
import { MapFilterBar } from '@/components/map/map-filter-bar'
import { PublicInteractiveMap } from '@/components/map/public-interactive-map'
import { MapEmptyState } from '@/components/map/map-empty-state'
import type { PublicMapDataResponse } from '@/lib/schema/map'

export const Route = createFileRoute('/pantau')({
  loader: async () => {
    return getPublicMapData({
      data: {
        incidentType: 'all',
        timeRange: '24h',
        handlingStatus: 'all',
      },
    })
  },
  head: () => ({
    meta: [
      {
        title:
          'Peta Pantau Sebaran Kebakaran & Satelit NASA FIRMS | SiagaWarga',
      },
      {
        name: 'description',
        content:
          'Pantau sebaran titik kebakaran terverifikasi warga dan titik panas satelit NASA FIRMS di seluruh Indonesia secara interaktif dan waktu nyata.',
      },
    ],
  }),
  pendingComponent: PantauPending,
  errorComponent: PantauError,
  component: PantauPage,
})

function PantauPage() {
  const initialData = Route.useLoaderData()

  // State Kontrol Filter Interaktif
  const [incidentType, setIncidentType] = React.useState('all')
  const [timeRange, setTimeRange] = React.useState<'24h' | '3d' | '7d'>('24h')
  const [showCitizenReports, setShowCitizenReports] = React.useState(true)
  const [showSatelliteHotspots, setShowSatelliteHotspots] = React.useState(true)

  const [mapData, setMapData] = React.useState<PublicMapDataResponse>(initialData)
  const [isLoadingFilter, setIsLoadingFilter] = React.useState(false)

  // Efek Pembaruan Data saat Filter Berubah
  React.useEffect(() => {
    let isCancelled = false

    async function applyFilter() {
      setIsLoadingFilter(true)
      try {
        const result = await getPublicMapData({
          data: {
            incidentType: incidentType as any,
            timeRange,
            handlingStatus: 'all',
          },
        })
        if (!isCancelled) {
          setMapData(result)
        }
      } catch (error) {
        console.warn('Gagal memperbarui data filter peta:', error)
      } finally {
        if (!isCancelled) {
          setIsLoadingFilter(false)
        }
      }
    }

    applyFilter()

    return () => {
      isCancelled = true
    }
  }, [incidentType, timeRange])

  const handleResetFilters = () => {
    setIncidentType('all')
    setTimeRange('24h')
    setShowCitizenReports(true)
    setShowSatelliteHotspots(true)
  }

  const hasActiveFilters =
    incidentType !== 'all' ||
    timeRange !== '24h' ||
    !showCitizenReports ||
    !showSatelliteHotspots

  const isEmpty =
    (!showCitizenReports || mapData.reports.length === 0) &&
    (!showSatelliteHotspots || mapData.hotspots.length === 0)

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:py-12">
      {/* Navigasi Breadcrumb Kembali */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          to="/"
          className="flex items-center gap-1 transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          <span>Beranda</span>
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">Peta Pantau</span>
      </nav>

      {/* Header Halaman Utama */}
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <MapPinIcon className="size-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Peta Sebaran Kebakaran & Satelit NASA
          </h1>
        </div>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Pantauan spasial titik kebakaran terverifikasi warga dan anomali panas
          satelit cuaca NASA FIRMS di seluruh wilayah kepulauan Indonesia.
        </p>
      </header>

      {/* 1. Bilah Telemetri Pantau */}
      <MapTelemetryHeader stats={mapData.stats} />

      {/* 2. Bilah Kontrol & Filter Dual-Layer */}
      <MapFilterBar
        incidentType={incidentType}
        onIncidentTypeChange={setIncidentType}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        showCitizenReports={showCitizenReports}
        onToggleCitizenReports={setShowCitizenReports}
        showSatelliteHotspots={showSatelliteHotspots}
        onToggleSatelliteHotspots={setShowSatelliteHotspots}
      />

      {/* 3. Peta Interaktif Utama atau Keadaan Nihil */}
      {isEmpty ? (
        <MapEmptyState
          hasActiveFilters={hasActiveFilters}
          onResetFilters={handleResetFilters}
        />
      ) : (
        <div className={isLoadingFilter ? 'opacity-80 transition-opacity' : ''}>
          <PublicInteractiveMap
            reports={mapData.reports}
            hotspots={mapData.hotspots}
            showCitizenReports={showCitizenReports}
            showSatelliteHotspots={showSatelliteHotspots}
          />
        </div>
      )}
    </div>
  )
}

function PantauPending() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:py-12">
      <Skeleton className="h-4 w-24" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-3/4 max-w-md" />
        <Skeleton className="h-4 w-1/2 max-w-sm" />
      </div>

      {/* Telemetry Shimmer */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Filter Bar Shimmer */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-6 w-3/4" />
      </div>

      {/* Map Skeleton */}
      <Skeleton className="h-[480px] w-full sm:h-[560px]" />
    </div>
  )
}

function PantauError({ error }: ErrorComponentProps) {
  const router = useRouter()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <Alert variant="destructive">
        <AlertCircleIcon className="size-4" />
        <AlertTitle>Gagal Memuat Peta Pantau</AlertTitle>
        <AlertDescription>
          <div className="space-y-4 pt-2">
            <p>
              {error instanceof Error
                ? error.message
                : 'Terjadi kendala saat menyambungkan data sebaran peta dan titik satelit.'}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.invalidate()}
              >
                <RotateCcwIcon className="size-3.5" />
                <span>Coba Lagi</span>
              </Button>

              <Button
                size="sm"
                variant="secondary"
                render={<Link to="/" />}
              >
                <ArrowLeftIcon className="size-3.5" />
                <span>Kembali ke Beranda</span>
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
