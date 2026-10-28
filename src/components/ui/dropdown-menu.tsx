import * as React from 'react'
import { Menu } from '@base-ui/react'
import { cn } from '@/lib/utils'

function DropdownMenu(props: React.ComponentProps<typeof Menu.Root>) {
  return <Menu.Root data-slot="dropdown-menu" {...props} />
}

interface DropdownMenuTriggerProps extends React.ComponentProps<
  typeof Menu.Trigger
> {
  shape?: 'default' | 'circle'
}

function DropdownMenuTrigger({
  className,
  shape = 'default',
  ...props
}: DropdownMenuTriggerProps) {
  return (
    <Menu.Trigger
      data-slot="dropdown-menu-trigger"
      data-shape={shape}
      className={cn(
        'cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        shape === 'circle' && 'rounded-full',
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuPortal(props: React.ComponentProps<typeof Menu.Portal>) {
  return <Menu.Portal data-slot="dropdown-menu-portal" {...props} />
}

interface DropdownMenuContentProps extends React.ComponentProps<
  typeof Menu.Popup
> {
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
}

function DropdownMenuContent({
  className,
  align = 'end',
  side = 'bottom',
  sideOffset = 8,
  children,
  ...props
}: DropdownMenuContentProps) {
  return (
    <Menu.Portal>
      <Menu.Positioner
        className="z-50"
        align={align}
        side={side}
        sideOffset={sideOffset}
      >
        <Menu.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            'z-50 min-w-48 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none',
            'transition-[opacity,scale] duration-150 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
            className,
          )}
          {...props}
        >
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  )
}

interface DropdownMenuItemProps extends React.ComponentProps<typeof Menu.Item> {
  variant?: 'default' | 'destructive' | 'primary'
}

function DropdownMenuItem({
  className,
  variant = 'default',
  ...props
}: DropdownMenuItemProps) {
  return (
    <Menu.Item
      data-slot="dropdown-menu-item"
      data-variant={variant}
      className={cn(
        'relative flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-1.5 text-sm transition-colors outline-none select-none',
        'hover:bg-muted focus:bg-muted',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        '[&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
        variant === 'default' && 'text-foreground',
        variant === 'primary' && 'font-medium text-primary',
        variant === 'destructive' &&
          'text-destructive focus:bg-destructive/10 focus:text-destructive',
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Menu.Separator>) {
  return (
    <Menu.Separator
      data-slot="dropdown-menu-separator"
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  )
}

function DropdownMenuGroup(props: React.ComponentProps<typeof Menu.Group>) {
  return <Menu.Group data-slot="dropdown-menu-group" {...props} />
}

function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dropdown-menu-label"
      className={cn(
        'px-2.5 py-1.5 text-xs font-medium text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
}
export type { DropdownMenuItemProps, DropdownMenuTriggerProps }
