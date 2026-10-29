import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SafetyGuideCardProps {
  icon: React.ComponentType<{ className?: string }>
  iconColorVariant: 'danger' | 'ember'
  title: string
  description: string
}

export function SafetyGuideCard({
  icon: Icon,
  iconColorVariant,
  title,
  description,
}: SafetyGuideCardProps) {
  return (
    <Card radius="2xl">
      <CardContent>
        {/* Pastel Icon Badge */}
        <div
          className={cn(
            'mb-4 flex size-12 items-center justify-center rounded-xl',
            iconColorVariant === 'danger' &&
              'bg-destructive/10 text-destructive',
            iconColorVariant === 'ember' &&
              'bg-[var(--color-ember)]/10 text-[var(--color-ember)]',
          )}
        >
          <Icon className="size-6 shrink-0" aria-hidden="true" />
        </div>

        <h3 className="mb-2 text-base font-bold text-foreground sm:text-lg">
          {title}
        </h3>

        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
