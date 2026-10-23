import { Link } from '@tanstack/react-router'
import { FlameIcon } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'

export function HeaderNav() {
  return (
    <header className="w-full border-b border-border bg-background/95 backdrop-blur-xs supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Telemetry Indicator */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-foreground transition-opacity hover:opacity-90"
          >
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
              <FlameIcon className="size-4" aria-hidden="true" />
            </span>
            <span className="text-base tracking-tight">SiagaWarga</span>
          </Link>
          <span className="hidden items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground sm:inline-flex">
            <span className="size-1.5 rounded-full bg-[var(--success)]" />
            <span>Telemetri Aktif</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:text-sm [&.active]:bg-muted [&.active]:text-foreground"
          >
            Beranda
          </Link>
          <Link
            to="/lapor"
            className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:text-sm [&.active]:bg-muted [&.active]:text-foreground"
          >
            Lapor Insiden
          </Link>
          <Link
            to="/pantau"
            className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:text-sm [&.active]:bg-muted [&.active]:text-foreground"
          >
            Pantau Peta
          </Link>

          <div className="ml-2 flex items-center border-l border-border pl-2">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  )
}
