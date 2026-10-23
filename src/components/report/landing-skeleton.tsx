import { Skeleton } from '@/components/ui/skeleton'

export function LandingSkeleton() {
  return (
    <div className="animate-fade-in mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6">
      {/* Hero Skeleton */}
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-full max-w-2xl" />
        <Skeleton className="h-6 w-full max-w-xl" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      {/* Quick Search Card Skeleton */}
      <Skeleton className="h-28 w-full max-w-xl" />

      {/* Telemetry Strip Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>

      {/* System Honesty Skeleton */}
      <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  )
}
