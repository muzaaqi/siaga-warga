'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from './empty'
import { MyReportCard } from './my-report-card'
import type { MyReportItem } from '@/lib/schema/profile'

interface MyReportsListProps {
  reports: MyReportItem[]
  isLoading?: boolean
  onCreateReport?: () => void
}

export function MyReportsList({ reports, isLoading = false, onCreateReport }: MyReportsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4" role="status" aria-label="Memuat laporan">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex flex-wrap gap-4">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <EmptyState
        variant="no-reports"
        actionLabel="Buat Laporan Baru"
        onAction={onCreateReport}
      />
    )
  }

  return (
    <div
      data-slot="my-reports-list"
      className={cn('space-y-4', reports.length > 0 && 'animate-in stagger-children fade-in-0 duration-300')}
    >
      {reports.map((report) => (
        <MyReportCard key={report.id} report={report} />
      ))}
    </div>
  )
}