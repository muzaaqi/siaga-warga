import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type AttachmentState =
  'idle' | 'uploading' | 'processing' | 'error' | 'done'

interface AttachmentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'pine'
  state?: AttachmentState
  size?: 'default' | 'sm' | 'xs'
  orientation?: 'horizontal' | 'vertical'
}

function Attachment({
  className,
  variant = 'default',
  state = 'done',
  size = 'default',
  orientation = 'horizontal',
  ...props
}: AttachmentProps) {
  return (
    <div
      data-slot="attachment"
      data-variant={variant}
      data-state={state}
      data-size={size}
      data-orientation={orientation}
      className={cn(
        'relative flex items-center gap-3 rounded-md border border-border bg-card p-2.5 text-sm transition-colors',
        orientation === 'vertical' && 'flex-col items-start',
        state === 'error' &&
          'border-destructive/40 bg-destructive/5 text-destructive',
        variant === 'pine' &&
          'border-[var(--color-pine)]/40 bg-[var(--color-pine)]/5',
        className,
      )}
      {...props}
    />
  )
}

interface AttachmentMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'icon' | 'image'
}

function AttachmentMedia({
  className,
  variant = 'icon',
  ...props
}: AttachmentMediaProps) {
  return (
    <div
      data-slot="attachment-media"
      data-variant={variant}
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded',
        variant === 'image'
          ? 'size-14 bg-muted object-cover'
          : 'size-9 bg-muted/60 text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

function AttachmentContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="attachment-content"
      className={cn('flex min-w-0 flex-1 flex-col gap-0.5', className)}
      {...props}
    />
  )
}

function AttachmentTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="attachment-title"
      className={cn('truncate text-sm font-medium text-foreground', className)}
      {...props}
    />
  )
}

function AttachmentDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="attachment-description"
      className={cn('truncate text-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

function AttachmentActions({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="attachment-actions"
      className={cn('flex shrink-0 items-center gap-1', className)}
      {...props}
    />
  )
}

function AttachmentAction({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      data-slot="attachment-action"
      className={className}
      {...props}
    />
  )
}

export {
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
}
