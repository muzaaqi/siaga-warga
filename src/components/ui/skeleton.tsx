import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const skeletonVariants = cva('animate-pulse bg-muted', {
  variants: {
    shape: {
      default: 'rounded-md',
      circle: 'rounded-full',
      card: 'rounded-xl',
    },
  },
  defaultVariants: {
    shape: 'default',
  },
})

interface SkeletonProps
  extends React.ComponentProps<'div'>, VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, shape, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(skeletonVariants({ shape }), className)}
      {...props}
    />
  )
}

export { Skeleton, skeletonVariants }
export type { SkeletonProps }
