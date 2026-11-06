import {
  FileTextIcon,
  ShieldCheckIcon,
  UserCogIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { AdminUserItem, UserRole } from '@/lib/schema/admin-users'
import { formatRelativeTime } from '@/lib/utils'

interface UserCardItemProps {
  user: AdminUserItem
  isCurrentUser: boolean
  onEditRole: (user: AdminUserItem) => void
}

export function UserCardItem({
  user,
  isCurrentUser,
  onEditRole,
}: UserCardItemProps) {
  const roleBadgeConfig: Record<
    UserRole,
    { label: string; variant: 'destructive' | 'success' | 'secondary' }
  > = {
    superadmin: {
      label: 'Administrator Utama',
      variant: 'destructive',
    },
    moderator: {
      label: 'Petugas Verifikator',
      variant: 'success',
    },
    citizen: {
      label: 'Warga Pelapor',
      variant: 'secondary',
    },
  }

  const roleInfo = roleBadgeConfig[user.role]
  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Kolom Kiri: Avatar & Identitas */}
          <div className="flex items-start gap-3 sm:items-center">
            <Avatar size="lg">
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name} />
              ) : null}
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-foreground sm:text-base">
                  {user.name}
                </span>
                {isCurrentUser ? (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    Akun Anda
                  </span>
                ) : null}
                <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
              </div>

              <span className="truncate text-xs text-muted-foreground sm:text-sm">
                {user.email}
              </span>

              {/* Statistik Kontribusi Warga / Moderator */}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
                <span className="inline-flex items-center gap-1 rounded bg-muted/60 px-2 py-0.5">
                  <FileTextIcon className="size-3" />
                  {user.reportsCount} Laporan
                </span>
                {user.role === 'moderator' || user.role === 'superadmin' ? (
                  <span className="inline-flex items-center gap-1 rounded bg-[var(--color-pine)]/10 px-2 py-0.5 text-[var(--color-pine)]">
                    <ShieldCheckIcon className="size-3" />
                    {user.moderationActionsCount} Verifikasi
                  </span>
                ) : null}
                <span>
                  Terdaftar{' '}
                  {formatRelativeTime(new Date(user.createdAt).toISOString())}
                </span>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Tombol Aksi */}
          <div className="flex items-center justify-end sm:shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditRole(user)}
            >
              <UserCogIcon className="size-3.5" />
              <span>Ubah Peran</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
