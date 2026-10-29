'use client'

import * as React from 'react'
import { useRouter } from '@tanstack/react-router'
import { SettingsIcon, FileTextIcon, Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import type { MyProfileAndReports } from '@/lib/schema/profile'
import { EditProfileForm } from './edit-profile-form'
import { MyReportsList } from './my-reports-list'
import { Route } from '@/routes/profil'

export function ProfilePage() {
  const router = useRouter()
  const data = Route.useLoaderData()
  const [activeTab, setActiveTab] = React.useState<'profile' | 'reports'>(
    'profile',
  )
  const [isEditing, setIsEditing] = React.useState(false)

  const handleProfileUpdate = () => {
    setIsEditing(false)
    router.invalidate()
  }

  const { user, reports } = (data as MyProfileAndReports | null) ?? {
    user: null,
    reports: [],
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Profil Saya
        </h1>
        <p className="text-muted-foreground">
          Kelola informasi profil dan lacak riwayat laporan Anda
        </p>
      </div>

      {/* Avatar & Quick Info */}
      <Card variant="canvas">
        <CardContent>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative shrink-0">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || 'Foto Profil'}
                  className="size-20 rounded-full object-cover ring-2 ring-border sm:size-24"
                />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-full bg-muted ring-2 ring-border sm:size-24">
                  <span className="text-3xl font-bold text-muted-foreground sm:text-4xl">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
              {isEditing && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute -right-1 -bottom-1"
                  onClick={() => setIsEditing(true)}
                  aria-label="Ganti avatar"
                >
                  <SettingsIcon className="size-4" />
                </Button>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h2 className="truncate text-xl font-semibold text-foreground sm:text-2xl">
                {user.name}
              </h2>
              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-pine)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-pine)]">
                  {user.role === 'moderator' ? (
                    <>
                      <FileTextIcon className="size-3" />
                      Petugas
                    </>
                  ) : user.role === 'superadmin' ? (
                    <>
                      <SettingsIcon className="size-3" />
                      Superadmin
                    </>
                  ) : (
                    <>
                      <FileTextIcon className="size-3" />
                      Warga
                    </>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  Bergabung{' '}
                  {new Date(user.createdAtIso).toLocaleDateString('id-ID', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="shrink-0"
              >
                <SettingsIcon className="mr-1.5 size-4" />
                Edit Profil
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList aria-label="Tab profil">
          <TabsTrigger value="profile">
            <SettingsIcon className="mr-2 size-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileTextIcon className="mr-2 size-4" />
            Laporan Saya ({reports.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          {isEditing ? (
            <EditProfileForm
              initialName={user.name}
              initialImage={user.image}
              onSuccess={handleProfileUpdate}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Informasi Profil</CardTitle>
                <CardDescription>
                  Informasi akun Anda. Klik "Edit Profil" untuk mengubah nama
                  dan avatar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Nama Lengkap
                    </label>
                    <p className="text-foreground">{user.name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Email
                    </label>
                    <p className="text-foreground">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Peran
                    </label>
                    <p className="text-foreground capitalize">{user.role}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Bergabung Sejak
                    </label>
                    <p className="text-foreground">
                      {new Date(user.createdAtIso).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto"
                >
                  <SettingsIcon className="mr-1.5 size-4" />
                  Edit Profil
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reports">
          <MyReportsList
            reports={reports}
            isLoading={false}
            onCreateReport={() => router.navigate({ to: '/lapor' })}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
