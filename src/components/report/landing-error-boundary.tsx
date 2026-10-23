import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircleIcon, RefreshCwIcon, PhoneCallIcon } from 'lucide-react'
import { useRouter } from '@tanstack/react-router'

interface LandingErrorBoundaryProps {
  error: unknown
  reset?: () => void
}

export function LandingErrorBoundary({
  error,
  reset,
}: LandingErrorBoundaryProps) {
  const router = useRouter()

  const handleRetry = () => {
    if (reset) {
      reset()
    } else {
      router.invalidate()
    }
  }

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Alert variant="destructive" className="mb-6">
        <AlertCircleIcon className="size-4" />
        <AlertTitle>Terjadi Kendala Memuat Data Beranda</AlertTitle>
        <AlertDescription className="mt-2">
          <div className="space-y-2">
            <p>
              Sistem gagal memuat data statistik terkini. Kami mohon maaf atas
              ketidaknyamanan ini. Silakan coba memuat ulang halaman.
            </p>
            {errorMessage && (
              <p className="rounded bg-black/10 p-2 font-mono text-xs opacity-80 dark:bg-white/10">
                Detail kendala: {errorMessage}
              </p>
            )}
          </div>
        </AlertDescription>
      </Alert>

      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={handleRetry} variant="default">
          <RefreshCwIcon className="mr-2 size-4" />
          <span>Coba Muat Ulang</span>
        </Button>
        <a
          href="tel:113"
          className="inline-flex items-center gap-2 text-sm font-medium text-destructive hover:underline"
        >
          <PhoneCallIcon className="size-4" />
          <span>Keadaan Darurat? Hubungi 113 Sekarang</span>
        </a>
      </div>
    </div>
  )
}
