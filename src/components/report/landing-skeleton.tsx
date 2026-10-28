import { Skeleton } from '@/components/ui/skeleton'

export function LandingSkeleton() {
  return (
    <div className="animate-fade-in mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6">
      {/* Hero Skeleton */}
      <div className="max-w-2xl space-y-4 pt-6">
        <Skeleton className="h-14 w-full max-w-xl" />
        <Skeleton className="h-6 w-full max-w-lg" />
        <Skeleton className="h-6 w-4/5" />
        <div className="pt-2">
          <Skeleton className="h-12 w-48" />
        </div>
      </div>

      {/* Quick Search Card Skeleton */}
      <div className="mx-auto max-w-4xl">
        <Skeleton className="h-32 w-full" />
      </div>

      {/* Safety Guide Section Skeleton */}
      <div className="mx-auto max-w-7xl pt-4">
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  )
}
