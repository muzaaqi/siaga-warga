import { RotateCcwIcon, ShieldCheckIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface MapEmptyStateProps {
  hasActiveFilters: boolean
  onResetFilters: () => void
}

export function MapEmptyState({
  hasActiveFilters,
  onResetFilters,
}: MapEmptyStateProps) {
  return (
    <Card className="w-full text-center">
      <CardContent>
        <div className="flex flex-col items-center justify-center py-6">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[var(--success)]/15 text-[var(--success)]">
            <ShieldCheckIcon className="size-6" />
          </div>

          <h3 className="text-base font-bold text-foreground">
            Kondisi Terpantau Kondusif
          </h3>

          <p className="mt-1 max-w-md text-xs text-muted-foreground sm:text-sm">
            Tidak ditemukan insiden kebakaran terverifikasi atau anomali titik panas
            satelit pada rentang kriteria filter yang Anda tentukan.
          </p>

          {hasActiveFilters && (
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onResetFilters}
              >
                <RotateCcwIcon className="size-3.5" />
                <span>Reset ke Filter Default</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
