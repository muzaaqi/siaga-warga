import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { quickTrackingSchema } from '@/lib/schema'

export function FloatingQuickTracking() {
  const navigate = useNavigate()
  const [trackingCode, setTrackingCode] = React.useState('')
  const [trackingError, setTrackingError] = React.useState<string | null>(null)

  const handleQuickTrackingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTrackingError(null)

    const result = quickTrackingSchema.safeParse({ trackingCode })
    if (!result.success) {
      setTrackingError(
        result.error.issues[0]?.message ??
          'Format kode tidak valid. Contoh: SW-2026-X89B',
      )
      return
    }

    navigate({
      to: '/lacak/$code',
      params: { code: result.data.trackingCode },
    })
  }

  return (
    <div className="relative z-20 mx-auto -mt-10 max-w-4xl px-4 sm:-mt-14 sm:px-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
        <div className="mb-4 space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            Cek Cepat Status Laporan
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Lacak perkembangan penanganan insiden kebakaran menggunakan kode
            tiket unik Anda.
          </p>
        </div>

        <form onSubmit={handleQuickTrackingSubmit} className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Input
                id="floating-tracking-code-input"
                variant="mono"
                placeholder="Contoh: SW-2026-X89B"
                value={trackingCode}
                onChange={(e) => {
                  setTrackingCode(e.target.value)
                  if (trackingError) setTrackingError(null)
                }}
                aria-invalid={!!trackingError}
                aria-describedby={
                  trackingError ? 'floating-tracking-code-error' : undefined
                }
              />
            </div>
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="shrink-0"
            >
              <SearchIcon className="size-4" aria-hidden="true" />
              <span>Lacak Status</span>
            </Button>
          </div>

          {trackingError && (
            <p
              id="floating-tracking-code-error"
              className="text-xs font-medium text-destructive"
              role="alert"
            >
              {trackingError}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
