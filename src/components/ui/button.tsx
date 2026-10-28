import * as React from 'react'
import { Button as BaseButton } from '@base-ui/react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:bg-primary/95',
        destructive:
          'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 active:bg-destructive/95',
        ember:
          'bg-[var(--color-ember)] text-white shadow-xs hover:bg-[oklch(0.48_0.19_45)] active:bg-[oklch(0.42_0.19_45)]',
        'outline-ember':
          'border border-[var(--color-ember)] bg-transparent text-[var(--color-ember)] shadow-xs hover:bg-[var(--color-ember)]/10 active:bg-[var(--color-ember)]/15',
        'outline-danger':
          'border border-[var(--color-danger)] bg-transparent text-[var(--color-danger)] shadow-xs hover:bg-[var(--color-danger)]/10 active:bg-[var(--color-danger)]/15',
        outline:
          'border border-border bg-background shadow-xs hover:bg-muted hover:text-foreground active:bg-muted/80',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-muted hover:text-foreground active:bg-muted/80',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        xs: 'h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*="size-"])]:size-3',
        sm: 'h-8 gap-1.5 rounded-md px-3 text-xs has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 text-base has-[>svg]:px-4',
        xl: 'h-12 rounded-xl px-6 text-base font-semibold has-[>svg]:px-4',
        pill: 'h-7 gap-1.5 rounded-full px-3 text-xs has-[>svg]:px-2.5',
        'pill-sm': 'h-6 gap-1 rounded-full px-2.5 text-[11px] has-[>svg]:px-2',
        icon: 'size-9',
        'icon-xs': 'size-6 rounded-md [&_svg:not([class*="size-"])]:size-3',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

interface ButtonProps
  extends
    React.ComponentProps<typeof BaseButton>,
    VariantProps<typeof buttonVariants> {
  className?: string
}

function Button({
  className,
  variant = 'default',
  size = 'default',
  nativeButton,
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      nativeButton={nativeButton ?? (props.render ? false : true)}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
