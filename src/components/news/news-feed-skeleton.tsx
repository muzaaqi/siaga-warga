import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
          size="sm"
          className="overflow-hidden"
        >
          {/* Header */}
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton shape="circle" className="size-9" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <Skeleton shape="circle" className="size-6" />
          </CardHeader>

          {/* Media Foto */}
          <Skeleton className="aspect-[4/3] w-full" />

          {/* Bar Aksi & Caption */}
          <CardContent>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <div className="flex items-center gap-1">
                  <Skeleton className="size-8" />
                  <Skeleton className="size-8" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>

              <Skeleton className="h-3 w-24" />

              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
