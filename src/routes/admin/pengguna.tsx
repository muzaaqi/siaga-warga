import * as React from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import {
  AlertCircleIcon,
  RotateCcwIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  UsersIcon,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { UserStatsHeader } from '@/components/admin/users/user-stats-header'
import { UserFilterBar } from '@/components/admin/users/user-filter-bar'
import { UserCardItem } from '@/components/admin/users/user-card-item'
import { UserEmptyState } from '@/components/admin/users/user-empty-state'
import { RoleChangeDialog } from '@/components/admin/users/role-change-dialog'
import type {
  AdminUserItem,
  AdminUsersQuery,
  AdminUsersResponse,
} from '@/lib/schema/admin-users'
import { getAuthSession } from '@/server/functions/auth'
import { getAdminUsersList } from '@/server/functions/admin-users'

export const Route = createFileRoute('/admin/pengguna')({
  head: () => ({
    meta: [
      {
        title: 'Manajemen Pengguna & Otorisasi | SiagaWarga',
      },
      {
        name: 'description',
        content:
          'Pusat kendali penetapan hak akses operasional moderator dan peninjauan akun warga terdaftar.',
      },
    ],
  }),
  loader: async () => {
    try {
      const session = await getAuthSession()
      const user = session?.user
      const role = user ? user.role : undefined

      if (!user || role !== 'superadmin') {
        return {
          authorized: false,
          usersData: null,
          currentUserId: null,
        }
      }

      const usersData = await getAdminUsersList({
        data: {
          search: '',
          role: 'all',
          limit: 50,
          offset: 0,
        },
      })

      return {
        authorized: true,
        usersData,
        currentUserId: user.id,
      }
    } catch {
      return {
        authorized: false,
        usersData: null,
        currentUserId: null,
      }
    }
  },
  pendingComponent: PenggunaPending,
  errorComponent: PenggunaError,
  component: AdminPenggunaPage,
})

function AdminPenggunaPage() {
  const loaderData = Route.useLoaderData()

  // Jika bukan superadmin, tampilkan layar pembatas akses yang manusiawi
  if (!loaderData.authorized || !loaderData.usersData) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center sm:py-16">
              <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive sm:size-14">
                <ShieldAlertIcon className="size-6 sm:size-7" />
              </div>
              <h2 className="mt-4 text-base font-bold text-foreground sm:text-xl">
                Hak Akses Khusus Administrator Utama
              </h2>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Halaman ini memiliki tingkat kerahasiaan tinggi dan hanya dapat
                diakses oleh administrator utama sistem SiagaWarga untuk mengelola
                hak akses moderator dan akun warga.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link to="/admin/triase" />}
                >
                  <ShieldCheckIcon className="size-3.5" />
                  <span>Buka Dasbor Triase</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  render={<Link to="/" />}
                >
                  Kembali ke Beranda
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <AdminPenggunaDashboard
      initialData={loaderData.usersData}
      currentUserId={loaderData.currentUserId}
    />
  )
}

interface AdminPenggunaDashboardProps {
  initialData: AdminUsersResponse
  currentUserId: string | null
}

function AdminPenggunaDashboard({
  initialData,
  currentUserId,
}: AdminPenggunaDashboardProps) {
  const [query, setQuery] = React.useState<AdminUsersQuery>({
    search: '',
    role: 'all',
    limit: 50,
    offset: 0,
  })

  const [usersResponse, setUsersResponse] =
    React.useState<AdminUsersResponse>(initialData)
  const [isLoading, setIsLoading] = React.useState(false)

  // Dialog state
  const [editingUser, setEditingUser] = React.useState<AdminUserItem | null>(
    null,
  )
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const handleQueryChange = React.useCallback(
    async (updates: Partial<AdminUsersQuery>) => {
      const nextQuery = { ...query, ...updates }
      setQuery(nextQuery)
      setIsLoading(true)

      try {
        const res = await getAdminUsersList({ data: nextQuery })
        setUsersResponse(res)
      } catch (err) {
        console.error('Gagal memperbarui daftar pengguna:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [query],
  )

  const handleReset = React.useCallback(async () => {
    const defaultQuery: AdminUsersQuery = {
      search: '',
      role: 'all',
      limit: 50,
      offset: 0,
    }
    setQuery(defaultQuery)
    setIsLoading(true)

    try {
      const res = await getAdminUsersList({ data: defaultQuery })
      setUsersResponse(res)
    } catch (err) {
      console.error('Gagal mereset filter pengguna:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleOpenEdit = (targetUser: AdminUserItem) => {
    setEditingUser(targetUser)
    setIsDialogOpen(true)
  }

  const handleRoleChangeSuccess = (updatedUser: AdminUserItem) => {
    // Perbarui entri pengguna secara lokal
    setUsersResponse((prev) => {
      const nextUsers = prev.users.map((u) =>
        u.id === updatedUser.id ? updatedUser : u,
      )

      // Hitung ulang statistik
      let citizen = 0
      let mod = 0
      let superadmin = 0

      for (const u of nextUsers) {
        if (u.role === 'superadmin') superadmin++
        else if (u.role === 'moderator') mod++
        else citizen++
      }

      return {
        ...prev,
        users: nextUsers,
        stats: {
          totalUsers: nextUsers.length,
          citizenCount: citizen,
          moderatorCount: mod,
          superadminCount: superadmin,
        },
      }
    })
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Tab Navigasi Admin */}
      <nav className="mb-6 flex items-center gap-2 border-b border-border/60 pb-3">
        <Button
          variant="ghost"
          size="sm"
          render={<Link to="/admin/triase" />}
        >
          <ShieldCheckIcon className="size-3.5" />
          <span>Dasbor Triase</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          render={<Link to="/admin/pengguna" />}
        >
          <UsersIcon className="size-3.5" />
          <span>Kelola Pengguna</span>
        </Button>
      </nav>

      {/* Header Halaman */}
      <header className="mb-6 flex flex-col gap-1.5 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          Manajemen Pengguna & Otorisasi
        </h1>
        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Pusat kendali penetapan hak akses operasional petugas verifikator dan
          peninjauan akun warga terdaftar.
        </p>
      </header>

      {/* Bagian 1: Metrik Telemetri Pengguna */}
      <section className="mb-6 sm:mb-8">
        <UserStatsHeader stats={usersResponse.stats} />
      </section>

      {/* Bagian 2: Bilah Filter & Pencarian */}
      <section className="mb-6">
        <UserFilterBar
          query={query}
          onQueryChange={handleQueryChange}
          onReset={handleReset}
        />
      </section>

      {/* Bagian 3: Daftar Akun Pengguna */}
      <section className="flex flex-col gap-3">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton shape="card" className="h-24 w-full" />
            <Skeleton shape="card" className="h-24 w-full" />
            <Skeleton shape="card" className="h-24 w-full" />
          </div>
        ) : usersResponse.users.length === 0 ? (
          <UserEmptyState onReset={handleReset} />
        ) : (
          usersResponse.users.map((targetUser) => (
            <UserCardItem
              key={targetUser.id}
              user={targetUser}
              isCurrentUser={targetUser.id === currentUserId}
              onEditRole={handleOpenEdit}
            />
          ))
        )}
      </section>

      {/* Dialog Konfirmasi Mutasi Peran */}
      <RoleChangeDialog
        user={editingUser}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleRoleChangeSuccess}
      />
    </div>
  )
}

function PenggunaPending() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="mb-6 flex flex-col gap-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Skeleton shape="card" className="h-20 w-full" />
        <Skeleton shape="card" className="h-20 w-full" />
        <Skeleton shape="card" className="h-20 w-full" />
        <Skeleton shape="card" className="h-20 w-full" />
      </div>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton shape="card" className="h-24 w-full" />
        <Skeleton shape="card" className="h-24 w-full" />
      </div>
    </div>
  )
}

function PenggunaError({ error, reset }: ErrorComponentProps) {
  const router = useRouter()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <Alert variant="destructive">
        <AlertCircleIcon className="size-4" />
        <AlertTitle>Gagal Memuat Manajemen Pengguna</AlertTitle>
        <AlertDescription className="mt-1">
          {error instanceof Error
            ? error.message
            : 'Terjadi kendala saat memuat data akun pengguna. Silakan coba kembali.'}
        </AlertDescription>
      </Alert>

      <div className="mt-4 flex items-center gap-3">
        <Button
          variant="default"
          size="sm"
          onClick={() => {
            reset()
            router.invalidate()
          }}
        >
          <RotateCcwIcon className="size-3.5" />
          <span>Coba Lagi</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          render={<Link to="/" />}
        >
          Kembali ke Beranda
        </Button>
      </div>
    </div>
  )
}
