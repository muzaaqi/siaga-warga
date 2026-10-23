import * as React from 'react'
import { Separator as BaseSeparator } from '@base-ui/react'
import { cn } from '@/lib/utils'

interface SeparatorProps extends React.ComponentProps<typeof BaseSeparator> {
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: SeparatorProps) {
  return (
    <BaseSeparator
      data-slot="separator"
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className,
      )}
      {...props}
    />
  )
}

export { Separator }
export type { SeparatorProps }
