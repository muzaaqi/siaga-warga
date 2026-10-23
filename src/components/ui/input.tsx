import * as React from 'react'
import { Input as BaseInput } from '@base-ui/react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20',
  {
    variants: {
      variant: {
        default: '',
        mono: 'font-mono uppercase placeholder:font-sans placeholder:normal-case',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface InputProps
  extends
    React.ComponentProps<typeof BaseInput>,
    VariantProps<typeof inputVariants> {
  className?: string
}

function Input({
  className,
  variant = 'default',
  type = 'text',
  ...props
}: InputProps) {
  return (
    <BaseInput
      data-slot="input"
      type={type}
      className={cn(inputVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Input, inputVariants }
export type { InputProps }
