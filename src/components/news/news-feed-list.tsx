import * as React from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  CheckCircle2Icon,
  FlameIcon,
  InboxIcon,
  PlusIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { NewsFeedResponse, NewsFilter } from '@/lib/schema/news'
import { getPublicNewsFeed } from '@/server/functions/news'
import { NewsFeedSkeleton } from './news-feed-skeleton'
import { NewsReportCard } from './news-report-card'

interface NewsFeedListProps {
  initialData?: NewsFeedResponse
}

export function NewsFeedList({ initialData }: NewsFeedListProps) {
  const [activeFilter, setActiveFilter] = React.useState<NewsFilter>('all')
  const sentinelRef = React.useRef<HTMLDivElement | null>(null)

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['publicNewsFeed', activeFilter],
    initialData:
      activeFilter === 'all' && initialData
        ? {
            pages: [initialData],
            pageParams: [undefined as string | undefined],
          }
        : undefined,
    queryFn: async ({ pageParam }) => {
      return getPublicNewsFeed({
        data: {
          cursor: pageParam,
          filter: activeFilter,
          limit: 10,
        },
      })
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 30, // 30 detik
  })

  // Setup IntersectionObserver untuk pemicuan infinite scroll otomatis
  React.useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        rootMargin: '300px', // Picu 300px sebelum mentok dasar halaman
      },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const allItems = React.useMemo(() => {
    return data.pages.flatMap((page) => page.items)
  }, [data.pages])

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      {/* Tab Filter Kategori Status */}
      <div className="flex items-center justify-center">
        <Tabs
          value={activeFilter}
          onValueChange={(val) => setActiveFilter(val as NewsFilter)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              <SparklesIcon className="size-3.5" aria-hidden="true" />
              <span>Semua</span>
            </TabsTrigger>
            <TabsTrigger value="verified">
              <CheckCircle2Icon className="size-3.5" aria-hidden="true" />
              <span>Valid</span>
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              <FlameIcon className="size-3.5" aria-hidden="true" />
              <span>Ditangani</span>
            </TabsTrigger>
            <TabsTrigger value="resolved">
              <ShieldCheckIcon className="size-3.5" aria-hidden="true" />
              <span>Selesai</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* State Kesalahan Saat Memuat */}
      {error && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm">
          <p className="font-semibold text-destructive">
            Gagal memuat feed kabar laporan warga.
          </p>
          <p className="text-xs text-muted-foreground">
            {error instanceof Error
              ? error.message
              : 'Terjadi kendala jaringan'}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-1"
          >
            <RotateCcwIcon className="size-3.5" aria-hidden="true" />
            <span>Coba Lagi</span>
          </Button>
        </div>
      )}

      {/* State Loading Pertama Kali (Skeleton) */}
      {isFetching && allItems.length === 0 && <NewsFeedSkeleton count={3} />}

      {/* Daftar Kartu Feed Laporan */}
      {allItems.length > 0 && (
        <div className="flex flex-col gap-6" data-slot="news-feed-stream">
          {allItems.map((item) => (
            <NewsReportCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* State Kosong (Empty State) */}
      {!isFetching && !error && allItems.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border/60 bg-card p-10 text-center shadow-xs">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <InboxIcon className="size-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Belum Ada Laporan Terpublikasi
            </h3>
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
              {activeFilter === 'all'
                ? 'Laporan yang dikirimkan warga akan tampil di feed ini secara transparan setelah melalui validasi awal.'
                : 'Belum ada laporan yang sesuai dengan kriteria filter saat ini.'}
            </p>
          </div>
          <Button
            variant="ember"
            size="sm"
            render={
              <Link to="/lapor" aria-label="Kirim laporan kebakaran baru" />
            }
          >
            <PlusIcon className="size-3.5" aria-hidden="true" />
            <span>Laporkan Kebakaran</span>
          </Button>
        </div>
      )}

      {/* Sentinel Elemen & Indikator Pemuatan Halaman Berikutnya */}
      <div ref={sentinelRef} className="py-2 text-center">
        {isFetchingNextPage && (
          <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
            <Spinner className="size-4" />
            <span>Memuat laporan berikutnya...</span>
          </div>
        )}

        {!hasNextPage && allItems.length > 0 && (
          <div className="py-8 text-center">
            <p className="text-xs text-muted-foreground">
              Seluruh laporan terkini telah ditampilkan.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
