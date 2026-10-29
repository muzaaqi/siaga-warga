import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProfileTabsProps {
  className?: string
  children: React.ReactNode
}

export function ProfileTabs({ className, children }: ProfileTabsProps) {
  return (
    <div data-slot="profile-tabs" className={cn('space-y-6', className)}>
      {children}
    </div>
  )
}

interface ProfileTabListProps {
  className?: string
  children: React.ReactNode
}

export function ProfileTabList({ className, children }: ProfileTabListProps) {
  return (
    <div
      data-slot="profile-tab-list"
      role="tablist"
      aria-label="Tab profil"
      className={cn('flex gap-1 border-b border-border', className)}
    >
      {children}
    </div>
  )
}

interface ProfileTabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
}

export function ProfileTab({
  className,
  isActive = false,
  children,
  ...props
}: ProfileTabProps) {
  return (
    <button
      role="tab"
      aria-selected={isActive}
      data-slot="profile-tab"
      className={cn(
        'relative px-4 py-3 text-sm font-medium transition-colors',
        'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none',
        isActive
          ? 'text-foreground [&::after]:absolute [&::after]:right-0 [&::after]:bottom-[-1px] [&::after]:left-0 [&::after]:h-0.5 [&::after]:bg-[#173b32]'
          : 'text-muted-foreground hover:text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

interface ProfileTabPanelProps {
  className?: string
  children: React.ReactNode
}

export function ProfileTabPanel({ className, children }: ProfileTabPanelProps) {
  return (
    <div
      role="tabpanel"
      data-slot="profile-tab-panel"
      className={cn('animate-in duration-200 fade-in-0', className)}
    >
      {children}
    </div>
  )
}
