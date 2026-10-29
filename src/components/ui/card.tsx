import * as React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.ComponentProps<'div'> {
  size?: 'default' | 'sm' | 'lg'
  variant?: 'default' | 'canvas' | 'elevated' | 'ghost'
  radius?: 'default' | 'xl' | '2xl' | '3xl'
}

function Card({
  className,
  size = 'default',
  variant = 'default',
  radius = 'default',
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(
        'group/card flex flex-col gap-(--card-spacing) overflow-hidden border border-border bg-card py-(--card-spacing) text-sm text-card-foreground shadow-xs [--card-spacing:--spacing(6)] has-data-[slot=card-footer]:pb-0 data-[size=lg]:gap-6 data-[size=lg]:py-8 data-[size=lg]:[--card-spacing:--spacing(8)] data-[size=lg]:has-data-[slot=card-footer]:pb-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:[--card-spacing:--spacing(4)] data-[size=sm]:has-data-[slot=card-footer]:pb-0',
        radius === 'default' && 'rounded-xl',
        radius === 'xl' && 'rounded-xl',
        radius === '2xl' && 'rounded-2xl',
        radius === '3xl' && 'rounded-3xl',
        variant === 'canvas' &&
          'border-border bg-[var(--color-canvas)] shadow-xl shadow-black/5 dark:bg-card/40',
        variant === 'elevated' &&
          'border-border/60 bg-card shadow-xl shadow-black/5',
        variant === 'ghost' && 'border-transparent bg-transparent shadow-none',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'group/card-header @container/card-header grid auto-rows-min items-start gap-1 px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)',
        className,
      )}
      {...props}
    />
  )
}

interface CardTitleProps extends React.ComponentProps<'div'> {
  size?: 'default' | 'lg' | 'xl'
}

function CardTitle({ className, size = 'default', ...props }: CardTitleProps) {
  return (
    <div
      data-slot="card-title"
      data-size={size}
      className={cn(
        'leading-none font-semibold tracking-tight text-foreground',
        size === 'lg' && 'text-lg',
        size === 'xl' && 'text-xl font-bold sm:text-2xl',
        className,
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm leading-relaxed text-muted-foreground', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 ml-auto flex items-center gap-2 self-start',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-(--card-spacing)', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex items-center border-t border-border bg-muted/30 p-(--card-spacing)',
        className,
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
}
export type { CardProps }
