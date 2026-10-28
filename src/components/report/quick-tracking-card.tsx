import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { TicketIcon } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Button } from '@/components/ui/button'
import { quickTrackingSchema } from '@/lib/schema'

export function QuickTrackingCard() {
  const navigate = useNavigate()
  const [trackingCode, setTrackingCode] = React.useState('')
  const [trackingError, setTrackingError] = React.useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTrackingError(null)

    const result = quickTrackingSchema.safeParse({ trackingCode })
    if (!result.success) {
      setTrackingError(
        result.error.issues[0]?.message ??
          'Format kode tidak valid. Contoh: SW-2026-XB9B',
      )
      return
    }

    navigate({
      to: '/lacak/$code',
      params: { code: result.data.trackingCode },
    })
  }

  return (
    <div className="relative -mt-14 px-4 sm:-mt-20 sm:px-6 lg:-mt-24 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Card variant="canvas" radius="2xl" size="lg">
          <CardHeader>
            <CardTitle size="xl">Cek Cepat Status laporan</CardTitle>
            <CardDescription>
              Lacak perkembangan penanganan insiden kebakaran menggunakan kode
              tiket unik anda
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
            >
              <div className="flex-1">
                <label htmlFor="quick-tracking-input" className="sr-only">
                  Kode Tiket Pelacakan
                </label>
                <InputGroup>
                  <InputGroupInput
                    id="quick-tracking-input"
                    variant="mono"
                    placeholder="Contoh: SW-2026-XB9B"
                    value={trackingCode}
                    onChange={(e) => {
                      setTrackingCode(e.target.value)
                      if (trackingError) setTrackingError(null)
                    }}
                    aria-invalid={!!trackingError}
                    aria-describedby={
                      trackingError ? 'tracking-error-notice' : undefined
                    }
                  />
                  <InputGroupAddon align="inline-start">
                    <TicketIcon aria-hidden="true" />
                  </InputGroupAddon>
                </InputGroup>
                {trackingError && (
                  <p
                    id="tracking-error-notice"
                    role="alert"
                    className="mt-1.5 text-xs font-medium text-destructive"
                  >
                    {trackingError}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="ember"
                size="xl"
                className="shrink-0"
              >
                Lacak Status
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
