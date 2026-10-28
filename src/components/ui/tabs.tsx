import * as React from 'react'
import { Tabs as BaseTabs } from '@base-ui/react'
import { cn } from '@/lib/utils'

function Tabs(props: React.ComponentProps<typeof BaseTabs.Root>) {
  return <BaseTabs.Root data-slot="tabs" {...props} />
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      data-slot="tabs-list"
      className={cn(
        'inline-flex items-center justify-center gap-1 rounded-md bg-muted p-1 text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      data-slot="tabs-trigger"
      className={cn(
        'relative inline-flex items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium outline-none transition-all',
        'focus-visible:ring-2 focus-visible:ring-ring/50',
        'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs',
        'data-[state=inactive]:hover:bg-muted/50',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Panel>) {
  return (
    <BaseTabs.Panel
      data-slot="tabs-content"
      className={cn(
        'animate-in fade-in-0 duration-200',
        className,
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }