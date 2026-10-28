import * as React from 'react'
import { Loader2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Memuat..."
      data-slot="spinner"
      className={cn('size-4 animate-spin text-current', className)}
      {...props}
    />
  )
}

export { Spinner }
