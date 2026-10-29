import { createFileRoute, useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { AlertCircleIcon, RotateCcwIcon } from 'lucide-react'
import { getMyProfileAndReports } from '@/server/functions/profile'
import { ProfilePage } from '@/components/profile/profile-page'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/profil')({
  head: () => ({
    meta: [
      {
        title: 'Profil Saya & Riwayat Laporan | SiagaWarga',
      },
      {
        name: 'description',
        content:
          'Kelola profil akun SiagaWarga Anda dan pantau status verifikasi serta penanganan seluruh laporan kebakaran yang telah Anda kirimkan.',
      },
    ],
  }),
  loader: async () => {
    const data = await getMyProfileAndReports()
    return data
  },
  pendingComponent: ProfilePending,
  errorComponent: ProfileError,
  component: ProfilePage,
})

function ProfilePending() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 sm:h-9" />
        <Skeleton className="h-4 w-72" />
      </div>

      <Card variant="canvas">
        <CardContent>
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
            <Skeleton shape="circle" className="size-20 sm:size-24" />
            <div className="flex min-w-0 flex-1 flex-col items-center space-y-2 sm:items-start">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-4 w-56" />
              <div className="flex items-center justify-center gap-2 pt-1 sm:justify-start">
                <Skeleton shape="circle" className="h-5 w-18" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3 pt-2">
        <Skeleton className="h-6 w-36" />
        <div className="space-y-3">
          <Skeleton shape="card" className="h-28 w-full" />
          <Skeleton shape="card" className="h-28 w-full" />
        </div>
      </div>
    </div>
  )
}

function ProfileError({ error, reset }: ErrorComponentProps) {
  const router = useRouter()

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Alert variant="destructive">
        <AlertCircleIcon className="size-4" />
        <AlertTitle>Gagal Memuat Profil Akun</AlertTitle>
        <AlertDescription className="mt-1">
          {(error instanceof Error ? error.message : undefined) ||
            'Terjadi kendala saat mengambil data profil atau riwayat laporan Anda. Pastikan Anda telah masuk dengan akun yang aktif.'}
        </AlertDescription>
      </Alert>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          onClick={() => {
            reset()
            router.invalidate()
          }}
        >
          <RotateCcwIcon className="size-4" />
          Coba Lagi
        </Button>
        <Button
          variant="secondary"
          onClick={() => router.navigate({ to: '/' })}
        >
          Kembali ke Beranda
        </Button>
      </div>
    </div>
  )
}
