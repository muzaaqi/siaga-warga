import {
  ShieldAlertIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  UsersIcon,
} from 'lucide-react'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { UserRoleStats } from '@/lib/schema/admin-users'

interface UserStatsHeaderProps {
  stats: UserRoleStats
}

export function UserStatsHeader({ stats }: UserStatsHeaderProps) {
  const metricCards = [
    {
      title: 'Total Pengguna',
      value: stats.totalUsers,
      description: 'Terdaftar via Google OAuth',
      icon: UsersIcon,
      accentColor: 'text-foreground',
    },
    {
      title: 'Warga Pelapor',
      value: stats.citizenCount,
      description: 'Akses lapor & lacak publik',
      icon: UserCheckIcon,
      accentColor: 'text-muted-foreground',
    },
    {
      title: 'Petugas Verifikator',
      value: stats.moderatorCount,
      description: 'Akses antrean triase insiden',
      icon: ShieldCheckIcon,
      accentColor: 'text-[var(--color-pine)]',
    },
    {
      title: 'Administrator Utama',
      value: stats.superadminCount,
      description: 'Otoritas peran & sistem',
      icon: ShieldAlertIcon,
      accentColor: 'text-destructive',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {metricCards.map((metric) => {
        const IconComponent = metric.icon
        return (
          <Card key={metric.title} size="sm">
            <CardHeader>
              <CardTitle>
                <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {metric.title}
                </span>
              </CardTitle>
              <CardAction>
                <IconComponent className={`size-4 ${metric.accentColor}`} />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-0.5">
                <span className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {metric.value}
                </span>
                <span className="text-[11px] text-muted-foreground sm:text-xs">
                  {metric.description}
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
