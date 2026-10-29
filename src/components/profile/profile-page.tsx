import { useRouter } from '@tanstack/react-router'
import { ProfileHeaderCard } from './profile-header-card'
import { MyReportsList } from './my-reports-list'
import { Route } from '@/routes/profil'

export function ProfilePage() {
  const router = useRouter()
  const { user, reports } = Route.useLoaderData()

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Halaman */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Profil Saya
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola informasi identitas akun dan pantau seluruh riwayat laporan
          kebakaran Anda
        </p>
      </div>

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
