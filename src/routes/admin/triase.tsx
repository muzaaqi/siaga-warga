import * as React from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import {
  AlertCircleIcon,
  RotateCcwIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  UsersIcon,
} from 'lucide-react'
import { TriageEmptyState } from '@/components/triage/triage-empty-state'
import { TriageFilterBar } from '@/components/triage/triage-filter-bar'
import { TriageQueueCard } from '@/components/triage/triage-queue-card'
import { TriageStatsHeader } from '@/components/triage/triage-stats-header'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { TriageQueueQuery, TriageQueueResponse } from '@/lib/schema/moderator'
import { getAuthSession } from '@/server/functions/auth'
import { getTriageQueue } from '@/server/functions/moderator'

export const Route = createFileRoute('/admin/triase')({
  head: () => ({
    meta: [
      {
        title: 'Dasbor Triase Moderator | SiagaWarga',
      },
      {
        name: 'description',
        content:
          'Pusat kendali triase laporan dan verifikasi insiden kebakaran bagi verifikator resmi.',
      },
    ],
  }),
  loader: async () => {
    try {
      const session = await getAuthSession()
      const user = session?.user
      const role = user ? user.role : undefined

      if (!user || (role !== 'moderator' && role !== 'superadmin')) {
        return {
          authorized: false,
          queueData: null,
          isSuperadmin: false,
        }
      }

      const queueData = await getTriageQueue({
        data: {
          priority: 'all',
          status: 'all',
          incidentType: 'all',
          search: '',
          limit: 50,
          offset: 0,
        },
      })

      return {
        authorized: true,
        queueData,
        isSuperadmin: role === 'superadmin',
      }
    } catch {
      return {
        authorized: false,
        queueData: null,
        isSuperadmin: false,
      }
    }
  },
  pendingComponent: TriasePending,
  errorComponent: TriaseError,
  component: AdminTriasePage,
})

function AdminTriasePage() {
  const loaderData = Route.useLoaderData()

  // Jika tidak memiliki izin moderator/superadmin
  if (!loaderData.authorized || !loaderData.queueData) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center sm:py-16">
              <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive sm:size-14">
                <ShieldAlertIcon className="size-6 sm:size-7" />
              </div>
              <h2 className="mt-4 text-base font-bold text-foreground sm:text-xl">
                Hak Akses Khusus Moderator
              </h2>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Halaman ini dikhususkan bagi aparatur verifikator dan penanganan
                darurat. Silakan masuk menggunakan akun Google yang memiliki peran
                moderator atau administrator.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link to="/" />}
                >
                  Kembali ke Beranda
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <TriageDashboard
      initialData={loaderData.queueData}
      isSuperadmin={loaderData.isSuperadmin}
    />
  )
}

interface TriageDashboardProps {
  initialData: TriageQueueResponse
  isSuperadmin: boolean
}

function TriageDashboard({ initialData, isSuperadmin }: TriageDashboardProps) {
  const [query, setQuery] = React.useState<TriageQueueQuery>({
    priority: 'all',
    status: 'all',
    incidentType: 'all',
    search: '',
    limit: 50,
    offset: 0,
  })

  const [queueResponse, setQueueResponse] =
    React.useState<TriageQueueResponse>(initialData)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleQueryChange = React.useCallback(
    async (updates: Partial<TriageQueueQuery>) => {
      const nextQuery = { ...query, ...updates }
      setQuery(nextQuery)
      setIsLoading(true)

      try {
        const res = await getTriageQueue({ data: nextQuery })
        setQueueResponse(res)
      } catch (err) {
        console.error('Gagal memperbarui antrean triase:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [query],
  )

  const handleReset = React.useCallback(async () => {
    const defaultQuery: TriageQueueQuery = {
      priority: 'all',
      status: 'all',
      incidentType: 'all',
      search: '',
      limit: 50,
      offset: 0,
    }
    setQuery(defaultQuery)
    setIsLoading(true)

    try {
      const res = await getTriageQueue({ data: defaultQuery })
      setQueueResponse(res)
    } catch (err) {
      console.error('Gagal mereset antrean triase:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Tab Navigasi Admin */}
      {isSuperadmin ? (
        <nav className="mb-6 flex items-center gap-2 border-b border-border/60 pb-3">
          <Button
            variant="secondary"
            size="sm"
            render={<Link to="/admin/triase" />}
          >
            <ShieldCheckIcon className="size-3.5" />
            <span>Dasbor Triase</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            render={<Link to="/admin/pengguna" />}
          >
            <UsersIcon className="size-3.5" />
            <span>Kelola Pengguna</span>
          </Button>
        </nav>
      ) : null}

      {/* Header Halaman */}
      <header className="mb-6 flex flex-col gap-1.5 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          Dasbor Triase Moderator
        </h1>
        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Pusat kendali evaluasi bukti kejadian dan penentuan prioritas
          penanganan kebakaran secara terpadu.
        </p>
      </header>

      {/* Bagian 1: Ringkasan Telemetri Antrean */}
      <section className="mb-6 sm:mb-8">
        <TriageStatsHeader stats={queueResponse.stats} />
      </section>

      {/* Bagian 2: Bilah Filter & Pencarian */}
      <section className="mb-6">
        <TriageFilterBar
          query={query}
          onQueryChange={handleQueryChange}
          onReset={handleReset}
        />
      </section>

      {/* Bagian 3: Daftar Antrean Laporan */}
      <section className="flex flex-col gap-3">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton shape="card" className="h-32 w-full" />
            <Skeleton shape="card" className="h-32 w-full" />
            <Skeleton shape="card" className="h-32 w-full" />
          </div>
        ) : queueResponse.items.length === 0 ? (
          <TriageEmptyState onReset={handleReset} />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>
                Menampilkan {queueResponse.items.length} laporan antrean
              </span>
            </div>
            {queueResponse.items.map((item) => (
              <TriageQueueCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function TriasePending() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="mb-6 space-y-2 sm:mb-8">
        <Skeleton className="h-8 w-64 sm:h-9" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Skeleton shape="card" className="h-24 w-full" />
        <Skeleton shape="card" className="h-24 w-full" />
        <Skeleton shape="card" className="h-24 w-full" />
        <Skeleton shape="card" className="h-24 w-full" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton shape="card" className="h-32 w-full" />
        <Skeleton shape="card" className="h-32 w-full" />
      </div>
    </div>
  )
}

function TriaseError({ error, reset }: ErrorComponentProps) {
  const router = useRouter()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <Alert variant="destructive">
        <AlertCircleIcon className="h-4 w-4" />
        <AlertTitle>Gagal Memuat Dasbor Triase</AlertTitle>
        <AlertDescription className="mt-1">
          {error instanceof Error
            ? error.message
            : 'Terjadi kendala saat memuat antrean laporan triase. Silakan coba kembali.'}
        </AlertDescription>
      </Alert>

      <div className="mt-4 flex items-center gap-3">
        <Button
          variant="default"
          size="sm"
          onClick={() => {
            reset()
            router.invalidate()
          }}
        >
          <RotateCcwIcon className="size-3.5" />
          <span>Coba Lagi</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          render={<Link to="/" />}
        >
          Kembali ke Beranda
        </Button>
      </div>
    </div>
  )
}
