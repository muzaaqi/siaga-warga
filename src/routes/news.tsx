import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { AlertCircleIcon, PlusIcon, RotateCcwIcon } from 'lucide-react'
import { NewsFeedList } from '@/components/news/news-feed-list'
import { NewsFeedSkeleton } from '@/components/news/news-feed-skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getPublicNewsFeed } from '@/server/functions/news'

export const Route = createFileRoute('/news')({
  head: () => ({
    meta: [
      {
        title: 'Kabar Warga: Laporan Kejadian Terkini | SiagaWarga',
      },
      {
        name: 'description',
        content:
          'Pantau laporan kebakaran langsung dari warga dan pantau perkembangan penanganan di lapangan secara transparan dan waktu nyata.',
      },
    ],
  }),
  loader: async () => {
    return getPublicNewsFeed({
      data: {
        limit: 10,
        filter: 'all',
      },
    })
  },
  pendingComponent: NewsPending,
  errorComponent: NewsError,
  component: NewsPage,
})

function NewsPending() {
  return (
    <main className="min-h-screen bg-background px-4 pt-6 pb-24 sm:px-6 sm:pt-8 lg:px-8">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="space-y-2 text-center sm:text-left">
          <Skeleton className="mx-auto h-8 w-44 sm:mx-0 sm:h-9 sm:w-52" />
          <Skeleton className="mx-auto h-4 w-full max-w-md sm:mx-0" />
        </div>
        <Skeleton className="h-10 w-full" />
        <NewsFeedSkeleton count={3} />
      </div>
    </main>
  )
}

function NewsError({ error }: ErrorComponentProps) {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-background px-4 pt-12 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertTitle>Gagal Memuat Kabar Warga</AlertTitle>
          <AlertDescription>
            <div className="space-y-4 pt-2">
              <p>
                {error instanceof Error
                  ? error.message
                  : 'Terjadi kendala saat mengambil data laporan publik.'}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.invalidate()}
              >
                <RotateCcwIcon className="size-4" />
                <span>Muat Ulang Halaman</span>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </main>
  )
}

function NewsPage() {
  const data = Route.useLoaderData()

  return (
    <main className="min-h-screen bg-background px-4 pt-6 pb-24 sm:px-6 sm:pt-8 lg:px-8">
      <div className="mx-auto max-w-xl space-y-6">
        {/* Header Seksi Kabar Warga */}
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Kabar Warga
            </h1>
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Pantau laporan kebakaran langsung dari warga dan perkembangan
              penanganan di lapangan secara transparan.
            </p>
          </div>

          <Button
            variant="ember"
            size="sm"
            className="shrink-0"
            render={
              <Link
                to="/lapor"
                aria-label="Kirim laporan kejadian kebakaran baru"
              />
            }
          >
            <PlusIcon className="size-4" aria-hidden="true" />
            <span>Lapor</span>
          </Button>
        </div>

        {/* Kontainer Stream Feed Kartu */}
        <NewsFeedList initialData={data} />
      </div>
    </main>
  )
}
