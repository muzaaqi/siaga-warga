import { createFileRoute, useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { AlertCircleIcon, RotateCcwIcon } from 'lucide-react'
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
      },
    })
  },
  pendingComponent: NewsPending,
  errorComponent: NewsError,
  component: NewsPage,
})

function NewsPage() {
  const data = Route.useLoaderData()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Header Halaman Utama (Mengikuti standar src/routes/lapor.tsx) */}
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          Kabar Warga
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Pantau laporan kebakaran langsung dari warga dan perkembangan
          penanganan di lapangan secara transparan.
        </p>
      </header>

      {/* Kontainer Stream Feed Kartu */}
      <NewsFeedList initialData={data} />
    </div>
  )
}

function NewsPending() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <Skeleton className="mb-4 h-5 w-32" />
      <Skeleton className="mb-2 h-10 w-3/4 max-w-md" />
      <Skeleton className="mb-8 h-4 w-1/2 max-w-sm" />
      <div className="mb-6">
        <Skeleton className="h-10 w-full" />
      </div>
      <NewsFeedSkeleton count={3} />
    </div>
  )
}

function NewsError({ error }: ErrorComponentProps) {
  const router = useRouter()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
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
  )
}
