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
              'bg-[#fef2f2] text-[#b42318] dark:bg-[#3d1612] dark:text-[#fca5a5]',
            iconColorVariant === 'ember' &&
              'bg-[#fff7ed] text-[#c2410c] dark:bg-[#3a1b0c] dark:text-[#fdba74]',
          )}
        >
          <Icon className="size-6 shrink-0" aria-hidden="true" />
        </div>

        <h3 className="mb-2 text-base font-bold text-[#173b32] sm:text-lg dark:text-foreground">
          {title}
        </h3>

        <p className="text-xs leading-relaxed text-[#475467] sm:text-sm dark:text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
