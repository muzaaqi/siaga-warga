import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function NewsFeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      className="mx-auto flex w-full max-w-xl flex-col gap-6"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loading items
          key={index}
          variant="canvas"
          className="overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 sm:p-4">
            <div className="flex items-center gap-3">
              <Skeleton shape="circle" className="size-9" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <Skeleton shape="circle" className="h-5 w-24" />
          </div>

          {/* Media Foto */}
          <Skeleton className="aspect-[4/3] w-full" />

          {/* Bar Aksi */}
          <div className="flex items-center justify-between border-b border-border/50 px-3 py-2 sm:px-4">
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>

          {/* Caption */}
          <div className="space-y-2 p-3.5 sm:p-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
