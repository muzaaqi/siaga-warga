import { CheckCircle2Icon, RotateCcwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface TriageEmptyStateProps {
  onReset?: () => void
}

export function TriageEmptyState({ onReset }: TriageEmptyStateProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center sm:py-16">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary sm:size-14">
            <CheckCircle2Icon className="size-6 sm:size-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground sm:text-lg">
            Tidak Ada Laporan yang Perlu Ditinjau
          </h3>
          <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Seluruh laporan warga pada filter ini telah selesai diverifikasi atau
            belum ada laporan baru yang masuk.
          </p>
          {onReset ? (
            <div className="mt-6">
              <Button variant="outline" size="sm" onClick={onReset}>
                <RotateCcwIcon className="size-3.5" />
                <span>Reset Filter Pencarian</span>
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
