import { useRouter } from '@tanstack/react-router'
import { ProfileHeaderCard } from './profile-header-card'
import { MyReportsList } from './my-reports-list'
import { Route } from '@/routes/profil'

export function ProfilePage() {
  const router = useRouter()
  const { user, reports } = Route.useLoaderData()

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:py-12">
      {/* Header Halaman (Mengikuti standar src/routes/lapor.tsx) */}
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          Profil Saya
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Kelola informasi identitas akun dan pantau seluruh riwayat laporan
          kebakaran Anda
        </p>
      </header>

      {/* Card Profil & Form Edit In-Place */}
      <ProfileHeaderCard
        user={user}
        onProfileUpdated={() => router.invalidate()}
      />

      {/* Daftar Riwayat Laporan Langsung di Bawah (Tanpa Tabs) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Laporan Saya ({reports.length})
          </h2>
        </div>
        <MyReportsList
          reports={reports}
          isLoading={false}
          onCreateReport={() => router.navigate({ to: '/lapor' })}
        />
      </div>
    </div>
  )
}
