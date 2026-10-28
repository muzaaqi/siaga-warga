import * as React from 'react'
import { Input as BaseInput } from '@base-ui/react'
import { cn } from '@/lib/utils'

interface InputGroupProps extends React.ComponentProps<'div'> {}

function InputGroup({ className, ...props }: InputGroupProps) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        'group/input-group relative flex w-full items-center rounded-xl border border-input bg-card shadow-xs transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50 has-[[data-slot=input-group-control]:disabled]:cursor-not-allowed has-[[data-slot=input-group-control]:disabled]:opacity-50 has-[[data-slot=input-group-control][aria-invalid=true]]:border-destructive has-[[data-slot=input-group-control][aria-invalid=true]]:ring-destructive/20',
        className,
      )}
      {...props}
    />
  )
}

interface InputGroupAddonProps extends React.ComponentProps<'div'> {
  align?: 'inline-start' | 'inline-end' | 'block-start' | 'block-end'
}

function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: InputGroupAddonProps) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        'pointer-events-none flex shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-5 [&_svg]:shrink-0',
        align === 'inline-start' && 'order-first pl-4',
        align === 'inline-end' && 'order-last pr-4',
        className,
      )}
      {...props}
    />
  )
}

interface InputGroupInputProps extends React.ComponentProps<typeof BaseInput> {
  variant?: 'default' | 'mono'
}

function InputGroupInput({
  className,
  variant = 'default',
  type = 'text',
  ...props
}: InputGroupInputProps) {
  return (
    <BaseInput
      data-slot="input-group-control"
      type={type}
      className={cn(
        'flex h-12 w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed md:text-base',
        variant === 'mono' &&
          'font-mono uppercase placeholder:font-sans placeholder:normal-case',
        className,
      )}
      {...props}
    />
  )
}

export { InputGroup, InputGroupAddon, InputGroupInput }
