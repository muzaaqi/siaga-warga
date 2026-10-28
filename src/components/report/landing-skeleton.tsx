import { Skeleton } from '@/components/ui/skeleton'

export function LandingSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-8 sm:px-6 md:py-12">
      {/* 1. Hero Skeleton (Two Column) */}
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <Skeleton className="h-14 w-full max-w-xl" />
          <Skeleton className="h-20 w-full max-w-lg" />
          <Skeleton className="h-12 w-48" />
        </div>
        <div className="lg:col-span-5">
          <Skeleton className="aspect-4/3 w-full max-w-lg lg:aspect-square" />
        </div>
      </div>

      {/* 2. Floating Search Card Skeleton */}
      <div className="mx-auto -mt-10 max-w-4xl sm:-mt-14">
        <Skeleton className="h-36 w-full" />
      </div>

      {/* 3. Telemetry Strip Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>

      {/* 4. Safety Guidelines Skeleton */}
      <Skeleton className="h-80 w-full" />

      {/* 5. System Honesty Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  )
}
