import { Link } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import {
  AlertTriangleIcon,
  HomeIcon,
  RotateCcwIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function GlobalErrorFallback({ error, reset }: Partial<ErrorComponentProps>) {
  const errorMessage =
    error instanceof Error ? error.message : 'Kesalahan sistem tidak terduga.'

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <Card size="lg" className="w-full text-center">
        <CardHeader className="flex flex-col items-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
            <AlertTriangleIcon className="size-7" />
          </div>

          <Badge variant="destructive">
            SYSTEM ERROR
          </Badge>

          <CardTitle size="xl">Terjadi Kendala pada Halaman</CardTitle>
          <CardDescription className="max-w-xl text-center">
            Sistem mengalami kendala sementara saat memproses permintaan ini.
            Silakan coba lagi atau kembali ke beranda.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Debug error info */}
            {errorMessage && (
              <div className="mx-auto max-w-lg rounded-lg border border-border bg-muted/50 p-3 text-left">
                <p className="font-mono text-xs text-muted-foreground break-all">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {reset && (
                <Button variant="default" onClick={reset}>
                  <RotateCcwIcon className="size-4" />
                  <span>Coba Lagi</span>
                </Button>
              )}

              <Button
                variant="outline"
                render={<Link to="/" />}
              >
                <HomeIcon className="size-4" />
                <span>Kembali ke Beranda</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
