import {
  AlertCircleIcon,
  CalendarIcon,
  ClockIcon,
  FlameIcon,
} from 'lucide-react'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { TriageStats } from '@/lib/schema/moderator'

interface TriageStatsHeaderProps {
  stats: TriageStats
}

export function TriageStatsHeader({ stats }: TriageStatsHeaderProps) {
  const metricCards = [
    {
      title: 'Menunggu Verifikasi',
      value: stats.pendingCount,
      description: 'Laporan baru perlu verifikasi',
      icon: ClockIcon,
      accentColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Perlu Tinjauan',
      value: stats.needsReviewCount,
      description: 'Bukti foto atau data anomali',
      icon: AlertCircleIcon,
      accentColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Prioritas Mendesak',
      value: stats.highPriorityCount,
      description: 'Dekat permukiman warga',
      icon: FlameIcon,
      accentColor: 'text-destructive',
    },
    {
      title: 'Laporan Hari Ini',
      value: stats.todayReportsCount,
      description: 'Masuk dalam 24 jam terakhir',
      icon: CalendarIcon,
      accentColor: 'text-muted-foreground',
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
                <IconComponent
                  className={`size-4 shrink-0 ${metric.accentColor}`}
                />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {metric.value}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
