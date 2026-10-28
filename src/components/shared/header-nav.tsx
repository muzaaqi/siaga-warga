import { Link } from '@tanstack/react-router'
import { FlameIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'

export function HeaderNav() {
  return (
    <header className="w-full border-b border-border bg-background/95 backdrop-blur-xs supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Telemetry Indicator */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-90"
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
              <FlameIcon className="size-4.5" aria-hidden="true" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              Siaga<span className="text-primary">Warga</span>
            </span>
          </Link>
          <span className="hidden items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground md:inline-flex">
            <span className="size-1.5 rounded-full bg-[var(--success)]" />
            <span>Telemetri Aktif</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className="relative px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm [&.active]:font-semibold [&.active]:text-foreground [&.active]:after:absolute [&.active]:after:right-3 [&.active]:after:bottom-[-18px] [&.active]:after:left-3 [&.active]:after:h-0.5 [&.active]:after:bg-primary"
          >
            Beranda
          </Link>
          <Link
            to="/lapor"
            className="px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm [&.active]:font-semibold [&.active]:text-foreground"
          >
            Lapor Insiden
          </Link>
          <Link
            to="/pantau"
            className="px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm [&.active]:font-semibold [&.active]:text-foreground"
          >
            Pantau Peta
          </Link>
          <a
            href="#panduan-keselamatan"
            className="hidden px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-block sm:text-sm"
          >
            Panduan Warga
          </a>

          <div className="ml-2 flex items-center gap-2 border-l border-border pl-3">
            <Link
              to="/lapor"
              className={cn(
                buttonVariants({ variant: 'default', size: 'sm' }),
                'hidden sm:inline-flex',
              )}
            >
              Lapor Cepat
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  )
}
