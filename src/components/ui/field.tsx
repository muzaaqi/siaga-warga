import * as React from 'react'
import { Field as BaseField, Fieldset as BaseFieldset } from '@base-ui/react'
import { cn } from '@/lib/utils'

function FieldSet({
  className,
  ...props
}: React.ComponentProps<typeof BaseFieldset.Root>) {
  return (
    <BaseFieldset.Root
      data-slot="fieldset"
      className={cn('flex flex-col gap-4', className)}
      {...props}
    />
  )
}

function FieldLegend({
  className,
  ...props
}: React.ComponentProps<typeof BaseFieldset.Legend>) {
  return (
    <BaseFieldset.Legend
      data-slot="field-legend"
      className={cn('text-sm font-semibold text-foreground', className)}
      {...props}
    />
  )
}

function FieldGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="field-group"
      className={cn('flex flex-col gap-4', className)}
      {...props}
    />
  )
}

interface FieldProps extends React.ComponentProps<typeof BaseField.Root> {
  orientation?: 'vertical' | 'horizontal'
}

function Field({ className, orientation = 'vertical', ...props }: FieldProps) {
  return (
    <BaseField.Root
      data-slot="field"
      data-orientation={orientation}
      className={cn(
        'flex gap-2',
        orientation === 'vertical'
          ? 'flex-col'
          : 'flex-row items-center justify-between',
        className,
      )}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof BaseField.Label>) {
  return (
    <BaseField.Label
      data-slot="field-label"
      className={cn(
        'text-sm leading-none font-medium text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    />
  )
}

function FieldDescription({
  className,
  ...props
}: React.ComponentProps<typeof BaseField.Description>) {
  return (
    <BaseField.Description
      data-slot="field-description"
      className={cn('text-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

function FieldError({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseField.Error>) {
  return (
    <BaseField.Error
      data-slot="field-error"
      className={cn('text-xs font-medium text-destructive', className)}
      {...props}
    >
      {children}
    </BaseField.Error>
  )
}

export {
  FieldSet,
  FieldLegend,
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
}
