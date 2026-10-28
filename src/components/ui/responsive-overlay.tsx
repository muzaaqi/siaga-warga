import * as React from 'react'
import { Dialog, Drawer } from '@base-ui/react'
import { XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

export interface ResponsiveOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export interface ResponsiveOverlayContentProps {
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function ResponsiveOverlay({
  open,
  onOpenChange,
  children,
}: ResponsiveOverlayProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        {children}
      </Dialog.Root>
    )
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Drawer.Root>
  )
}

export interface ResponsiveOverlayTriggerProps extends React.ComponentProps<'button'> {
  render?: React.ReactElement
  nativeButton?: boolean
}

export function ResponsiveOverlayTrigger({
  children,
  render,
  ...props
}: ResponsiveOverlayTriggerProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Dialog.Trigger render={render as React.ReactElement} {...props}>
        {children}
      </Dialog.Trigger>
    )
  }

  return (
    <Drawer.Trigger render={render as React.ReactElement} {...props}>
      {children}
    </Drawer.Trigger>
  )
}

export function ResponsiveOverlayContent({
  title,
  description,
  children,
  className,
}: ResponsiveOverlayContentProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-200" />
        <Dialog.Popup
          className={cn(
            'fixed top-1/2 left-1/2 z-50 flex w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-xl transition-all duration-200 focus-visible:outline-none',
            className,
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              {title && (
                <Dialog.Title className="text-lg font-semibold text-foreground">
                  {title}
                </Dialog.Title>
              )}
              {description && (
                <Dialog.Description className="text-sm text-muted-foreground">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  shape="circle"
                  aria-label="Tutup"
                >
                  <XIcon className="size-4" />
                </Button>
              }
            />
          </div>

          <div className="flex-1 overflow-y-auto">{children}</div>
        </Dialog.Popup>
      </Dialog.Portal>
    )
  }

  return (
    <Drawer.Portal>
      <Drawer.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-200" />
      <Drawer.Popup
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl border-t border-border bg-card p-4 shadow-2xl transition-transform duration-200 focus-visible:outline-none',
          className,
        )}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted-foreground/30" />

        <div className="flex items-start justify-between gap-2 pb-2">
          <div className="flex flex-col gap-1">
            {title && (
              <Drawer.Title className="text-base font-semibold text-foreground">
                {title}
              </Drawer.Title>
            )}
            {description && (
              <Drawer.Description className="text-xs text-muted-foreground">
                {description}
              </Drawer.Description>
            )}
          </div>
          <Drawer.Close
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                shape="circle"
                aria-label="Tutup"
              >
                <XIcon className="size-4" />
              </Button>
            }
          />
        </div>

        <div className="flex-1 overflow-y-auto pt-2">{children}</div>
      </Drawer.Popup>
    </Drawer.Portal>
  )
}
