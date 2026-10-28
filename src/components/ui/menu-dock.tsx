import * as React from 'react'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Button as BaseButton } from '@base-ui/react'
import { cn } from '@/lib/utils'

const ITEM = '[data-slot="menu-dock-item"]'

/** How long a chosen icon stays up when it hops, in milliseconds. */
const HOP_MS = 180

interface MenuDockContextValue {
  animated: boolean
  select: (value: string) => void
  value: string | null
}

const MenuDockContext = createContext<MenuDockContextValue>({
  animated: true,
  select: () => undefined,
  value: null,
})

/** The dock's own items, in order: never a nested dock's. */
const itemsOf = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(ITEM)).filter(
    (item) =>
      item.closest('[data-slot="menu-dock"]') === root &&
      !item.hasAttribute('disabled'),
  )

/** Where `node` sits inside `root`, by layout (transforms don't move it). */
const offsetIn = (node: HTMLElement, root: HTMLElement) => {
  let left = 0
  let top = 0
  let current: HTMLElement | null = node
  while (current && current !== root) {
    left += current.offsetLeft
    top += current.offsetTop
    current = current.offsetParent as HTMLElement | null
  }
  return { height: node.offsetHeight, left, top, width: node.offsetWidth }
}

/**
 * Moves the indicator to the active item: an underline under its label, a
 * short bar under its icon when it has no label, or a bar on its leading
 * edge when the dock is vertical. The first placement doesn't slide.
 */
const place = (root: HTMLElement) => {
  const indicator = root.querySelector<HTMLElement>(
    '[data-slot="menu-dock-indicator"]',
  )
  if (!indicator) {
    return
  }
  const item = itemsOf(root).find((node) => node.hasAttribute('data-active'))
  if (!item) {
    indicator.removeAttribute('data-placed')
    return
  }
  const box = offsetIn(item, root)
  const label = item.querySelector<HTMLElement>('[data-slot="menu-dock-label"]')
  const vertical = root.getAttribute('data-orientation') === 'vertical'
  const rtl = getComputedStyle(root).direction === 'rtl'
  let x = box.left + box.width / 2 - 8
  let y = box.top + box.height - 5
  let width = 16
  let height = 2
  if (vertical) {
    width = 3
    height = box.height / 2
    x = rtl ? box.left + box.width - width : box.left
    y = box.top + box.height / 4
  } else if (label) {
    const text = offsetIn(label, root)
    x = text.left
    y = text.top + text.height + 2
    ;({ width } = text)
  }
  indicator.style.setProperty('--menu-dock-x', `${x}px`)
  indicator.style.setProperty('--menu-dock-y', `${y}px`)
  indicator.style.setProperty('--menu-dock-width', `${width}px`)
  indicator.style.setProperty('--menu-dock-height', `${height}px`)
  if (!indicator.hasAttribute('data-placed')) {
    // Lands without sliding: the transition only applies once it's placed.
    indicator.getBoundingClientRect()
    indicator.setAttribute('data-placed', '')
  }
}

/** The arrow keys, Home and End move focus along the dock (mirrored in RTL). */
const moveFocus = (event: React.KeyboardEvent<HTMLElement>) => {
  const root = event.currentTarget
  const items = itemsOf(root)
  const index = items.indexOf(document.activeElement as HTMLElement)
  if (index < 0) {
    return
  }
  const vertical = root.getAttribute('data-orientation') === 'vertical'
  const rtl = getComputedStyle(root).direction === 'rtl'
  let forward = rtl ? 'ArrowLeft' : 'ArrowRight'
  let backward = rtl ? 'ArrowRight' : 'ArrowLeft'
  if (vertical) {
    forward = 'ArrowDown'
    backward = 'ArrowUp'
  }
  let next = -1
  if (event.key === forward) {
    next = (index + 1) % items.length
  } else if (event.key === backward) {
    next = (index - 1 + items.length) % items.length
  } else if (event.key === 'Home') {
    next = 0
  } else if (event.key === 'End') {
    next = items.length - 1
  }
  if (next < 0) {
    return
  }
  event.preventDefault()
  items[next].focus()
}

export interface MenuDockProps extends Omit<
  React.ComponentProps<'nav'>,
  'defaultValue'
> {
  /**
   * Whether a chosen item's icon hops once.
   *
   * @default true
   */
  animated?: boolean
  /** The item active at first, when uncontrolled. */
  defaultValue?: string
  /** Called with an item's value when it's chosen. */
  onValueChange?: (value: string) => void
  /**
   * A row (an underline marks the active item) or a column (a bar on its
   * leading edge).
   *
   * @default "horizontal"
   */
  orientation?: 'horizontal' | 'vertical'
  /**
   * The items' padding, icons and text.
   *
   * @default "default"
   */
  size?: 'sm' | 'default' | 'lg'
  /** The active item, when controlled. */
  value?: string
}

/**
 * A dock of icons with labels: the active item takes the primary colour and
 * an indicator slides to it. The arrow keys move along the items; with
 * reduced motion the indicator jumps and nothing hops.
 *
 * @cssvar --menu-dock-x The indicator's place, set from the active item.
 */
export const MenuDock = (props: MenuDockProps) => {
  const {
    animated = true,
    defaultValue,
    onValueChange,
    orientation = 'horizontal',
    size = 'default',
    value: valueProp,
    className,
    children,
    ...rest
  } = props

  const ref = useRef<HTMLElement>(null)
  const [uncontrolled, setUncontrolled] = useState<string | null>(
    defaultValue ?? null,
  )
  const value = valueProp === undefined ? uncontrolled : valueProp

  const select = (next: string) => {
    if (valueProp === undefined) {
      setUncontrolled(next)
    }
    onValueChange?.(next)
  }

  // Re-placed when the active item changes, and when anything resizes (a font loading, a wrap).
  useEffect(() => {
    const root = ref.current
    if (!root) {
      return
    }
    place(root)
    const observer = new ResizeObserver(() => place(root))
    observer.observe(root)
    for (const item of itemsOf(root)) {
      observer.observe(item)
    }
    return () => observer.disconnect()
  }, [value, orientation, size])

  return (
    <MenuDockContext.Provider value={{ animated, select, value }}>
      <nav
        className={cn(
          'group/menu-dock',
          'relative inline-flex items-center gap-1',
          'rounded-xl border border-border/70 bg-card/90 p-1.5 text-card-foreground shadow-xs backdrop-blur-md',
          'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
          'data-[size=lg]:p-2.5 data-[size=sm]:p-1',
          className,
        )}
        data-orientation={orientation}
        data-size={size}
        data-slot="menu-dock"
        onKeyDown={moveFocus}
        ref={ref}
        {...rest}
      >
        {children}
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute top-0 left-0 rounded-lg bg-[var(--color-ember)]',
            'h-(--menu-dock-height) w-(--menu-dock-width) [translate:var(--menu-dock-x)_var(--menu-dock-y)]',
            'opacity-0 data-placed:opacity-100',
            'data-placed:transition-[translate,width,height,opacity] data-placed:duration-300 data-placed:ease-[cubic-bezier(0.22,1,0.36,1)]',
            'motion-reduce:transition-none!',
          )}
          data-slot="menu-dock-indicator"
        />
      </nav>
    </MenuDockContext.Provider>
  )
}

export interface MenuDockItemProps extends React.ComponentProps<
  typeof BaseButton
> {
  /** The item's value: the dock's `value` when it's active. */
  value: string
  /** Visual variant: default neutral or ember highlighted CTA */
  variant?: 'default' | 'ember'
}

export const MenuDockItem = (props: MenuDockItemProps) => {
  const {
    value,
    className,
    onClick,
    nativeButton,
    variant = 'default',
    ...rest
  } = props
  const { animated, select, value: current } = useContext(MenuDockContext)
  const active = current === value

  return (
    <BaseButton
      nativeButton={nativeButton ?? (rest.render ? false : true)}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group/menu-dock-item',
        'relative flex min-w-14 flex-col items-center justify-center gap-1 p-2',
        'cursor-pointer rounded-lg transition-colors outline-none select-none',
        'focus-visible:ring-[2px] focus-visible:ring-ring/50',
        'disabled:pointer-events-none disabled:opacity-50',
        'group-data-[size=sm]/menu-dock:min-w-12 group-data-[size=sm]/menu-dock:p-1.5',
        'group-data-[size=lg]/menu-dock:min-w-16 group-data-[size=lg]/menu-dock:p-3',
        'motion-reduce:transition-none',
        variant === 'default' && [
          'text-muted-foreground',
          'hover:bg-muted/60 hover:text-foreground',
          'data-active:font-semibold data-active:text-[var(--color-forest)] dark:data-active:text-foreground',
        ],
        variant === 'ember' && [
          'bg-[var(--color-ember)] font-semibold text-white shadow-xs',
          'hover:bg-[oklch(0.48_0.19_45)] active:bg-[oklch(0.42_0.19_45)]',
          'dark:text-white',
        ],
        className,
      )}
      data-active={active ? '' : undefined}
      data-slot="menu-dock-item"
      data-value={value}
      data-variant={variant}
      onClick={(event) => {
        onClick?.(event)
        select(value)
        if (animated) {
          const item = event.currentTarget
          item.setAttribute('data-hop', '')
          setTimeout(() => item.removeAttribute('data-hop'), HOP_MS)
        }
      }}
      type="button"
      {...rest}
    />
  )
}

export const MenuDockIcon = (props: React.ComponentProps<'span'>) => {
  const { className, ...rest } = props

  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex items-center justify-center',
        'transition-[translate] duration-150 ease-out',
        'group-data-hop/menu-dock-item:[translate:0_-30%]',
        '[&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-5',
        'group-data-[size=sm]/menu-dock:[&_svg:not([class*="size-"])]:size-4',
        'group-data-[size=lg]/menu-dock:[&_svg:not([class*="size-"])]:size-6',
        'motion-reduce:[translate:none] motion-reduce:transition-none',
        className,
      )}
      data-slot="menu-dock-icon"
      {...rest}
    />
  )
}

export const MenuDockLabel = (props: React.ComponentProps<'span'>) => {
  const { className, ...rest } = props

  return (
    <span
      className={cn(
        'text-xs leading-4 font-medium whitespace-nowrap sm:text-sm sm:leading-5',
        'group-data-[size=sm]/menu-dock:text-xs group-data-[size=sm]/menu-dock:leading-4',
        'group-data-[size=lg]/menu-dock:text-base group-data-[size=lg]/menu-dock:leading-6',
        className,
      )}
      data-slot="menu-dock-label"
      {...rest}
    />
  )
}
