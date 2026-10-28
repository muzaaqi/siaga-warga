'use client'

import * as React from 'react'
import { useRouter } from '@tanstack/react-router'
import { SettingsIcon, FileTextIcon, Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { EditProfileForm } from './edit-profile-form'
import { MyReportsList } from './my-reports-list'
import { Route } from '@/routes/profil'

export function ProfilePage() {
  const router = useRouter()
  const data = Route.useLoaderData()
  const [activeTab, setActiveTab] = React.useState<'profile' | 'reports'>('profile')
  const [isEditing, setIsEditing] = React.useState(false)

  const handleProfileUpdate = () => {
    setIsEditing(false)
    router.invalidate()
  }

  const dataWithNull = data as { user: { name: string; email: string; image: string | null; role: string; createdAtIso: string } | null; reports: Array<{ id: string; trackingCode: string; incidentType: string; description: string; submittedAtIso: string; addressDisplay: string | null; verificationStatus: string; handlingStatus: string; isPotentialDuplicate: boolean }> } | null
  const { user, reports } = dataWithNull ?? { user: null, reports: [] }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profil Saya</h1>
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
                  className="size-20 sm:size-24 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div className="size-20 sm:size-24 rounded-full bg-muted flex items-center justify-center ring-2 ring-border">
                  <span className="text-3xl sm:text-4xl font-bold text-muted-foreground">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
              {isEditing && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute -bottom-1 -right-1"
                  onClick={() => setIsEditing(true)}
                  aria-label="Ganti avatar"
                >
                  <SettingsIcon className="size-4" />
                </Button>
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground truncate">
                {user.name}
              </h2>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
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
                  Bergabung {new Date(user.createdAtIso).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
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
                <SettingsIcon className="size-4 mr-1.5" />
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
            <SettingsIcon className="size-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileTextIcon className="size-4 mr-2" />
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
                  Informasi akun Anda. Klik "Edit Profil" untuk mengubah nama dan avatar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Nama Lengkap</label>
                    <p className="text-foreground">{user.name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Email</label>
                    <p className="text-foreground">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Peran</label>
                    <p className="text-foreground capitalize">{user.role}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Bergabung Sejak</label>
                    <p className="text-foreground">
                      {new Date(user.createdAtIso).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                  <SettingsIcon className="size-4 mr-1.5" />
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