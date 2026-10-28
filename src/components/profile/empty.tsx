import { FileTextIcon, ShieldCheckIcon, PlusIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  variant: 'no-reports' | 'no-profile'
  className?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  variant,
  className,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const configs = {
    'no-reports': {
      icon: FileTextIcon,
      title: 'Belum Ada Laporan',
      description:
        'Anda belum pernah mengirim laporan kebakaran hutan dan lahan. Mulai pelaporan untuk membantu mitigasi karhutla.',
      actionLabel: actionLabel ?? 'Buat Laporan Baru',
    },
    'no-profile': {
      icon: ShieldCheckIcon,
      title: 'Profil Belum Lengkap',
      description:
        'Lengkapi profil Anda dengan menambahkan nama dan memilih avatar taktis untuk identitas warga SiagaWarga.',
      actionLabel: actionLabel ?? 'Edit Profil',
    },
  }

  const config = configs[variant]
  const Icon = config.icon

  return (
    <div
      data-slot="profile-empty-state"
      className={cn(
        'flex flex-col items-center justify-center gap-4 p-8 text-center border border-border/50 rounded-xl bg-card/50',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-muted p-4',
          variant === 'no-reports' && 'text-[var(--color-ember)]',
          variant === 'no-profile' && 'text-[var(--color-pine)]',
        )}
      >
        <Icon className="size-8" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">{config.title}</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {config.description}
        </p>
      </div>
      {(actionLabel || onAction) && (
        <Button
          variant="ember"
          size="sm"
          onClick={onAction}
        >
          <PlusIcon className="size-4" />
          {actionLabel ?? config.actionLabel}
        </Button>
      )}
    </div>
  )
}