import {
  FileCheck2Icon,
  LayersIcon,
  ShieldCheckIcon,
  TruckIcon,
  AlertCircleIcon,
  ClockIcon,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TrackingTimelinePhase } from '@/lib/schema/tracking'

interface TrackingStepperProps {
  phases: Array<TrackingTimelinePhase>
}

export function TrackingStepper({ phases }: TrackingStepperProps) {
  const getPhaseIcon = (phaseKey: string, status: string) => {
    if (status === 'rejected') {
      return <AlertCircleIcon className="size-4" />
    }

    switch (phaseKey) {
      case 'received':
        return <FileCheck2Icon className="size-4" />
      case 'analyzed':
        return <LayersIcon className="size-4" />
      case 'verified':
        return <ShieldCheckIcon className="size-4" />
      case 'handling':
        return <TruckIcon className="size-4" />
      default:
        return <ClockIcon className="size-4" />
    }
  }

  const getStatusClasses = (status: TrackingTimelinePhase['status']) => {
    switch (status) {
      case 'completed':
        return {
          circle:
            'border-primary bg-primary text-primary-foreground shadow-xs',
          line: 'bg-primary',
          badgeVariant: 'success' as const,
        }
      case 'in_progress':
        return {
          circle:
            'border-[var(--warning)] bg-[var(--warning)] text-[var(--warning-foreground)] shadow-xs animate-pulse',
          line: 'bg-border',
          badgeVariant: 'warning' as const,
        }
      case 'rejected':
        return {
          circle:
            'border-destructive bg-destructive text-destructive-foreground shadow-xs',
          line: 'bg-border',
          badgeVariant: 'destructive' as const,
        }
      case 'pending':
      default:
        return {
          circle:
            'border-border/80 bg-muted/70 text-muted-foreground',
          line: 'bg-border/60',
          badgeVariant: 'outline' as const,
        }
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Linimasa Audit 4 Fase Penanganan</CardTitle>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Tahapan penanganan bencana terpantau secara transparan dan terverifikasi
            langsung oleh sistem serta petugas lapangan.
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative flex flex-col gap-6 pl-2 sm:pl-3">
          {phases.map((phase, index) => {
            const isLast = index === phases.length - 1
            const config = getStatusClasses(phase.status)

            return (
              <div key={phase.phaseKey} className="relative flex items-start gap-4">
                {/* Connecting Line */}
                {!isLast && (
                  <div
                    className={cn(
                      'absolute top-9 left-[17px] -bottom-6 w-0.5 transition-colors',
                      config.line,
                    )}
                    aria-hidden="true"
                  />
                )}

                {/* Node Icon Circle */}
                <div
                  className={cn(
                    'relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-all',
                    config.circle,
                  )}
                >
                  {getPhaseIcon(phase.phaseKey, phase.status)}
                </div>

                {/* Content Node */}
                <div className="flex-1 space-y-1.5 pt-0.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        Fase 0{phase.phaseIndex}
                      </span>
                      <h2 className="text-sm font-semibold text-foreground sm:text-base">
                        {phase.title}
                      </h2>
                    </div>

                    <Badge variant={config.badgeVariant} size="xs">
                      {phase.badgeLabel}
                    </Badge>
                  </div>

                  <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {phase.description}
                  </p>

                  {/* Catatan Alasan (Reason Note) jika ada */}
                  {phase.note && (
                    <div className="mt-2 rounded-md border border-border/80 bg-muted/40 p-2.5 text-xs text-foreground">
                      <span className="font-semibold text-muted-foreground">
                        Catatan Resmi Petugas:
                      </span>{' '}
                      {phase.note}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
