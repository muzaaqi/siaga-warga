import { Link } from '@tanstack/react-router'
import { ThemeToggle } from './theme-toggle'
import { buttonVariants } from '@/components/ui/button'

export function HeaderNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#f2f4f7] bg-card/95 backdrop-blur-xs transition-colors dark:border-border dark:bg-card/90">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo Resmi SiagaWarga */}
        <Link
          to="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-90"
          aria-label="SiagaWarga - Beranda"
        >
          <img
            src="/logo.png"
            alt="SiagaWarga"
            className="h-8 w-auto object-contain sm:h-9"
          />
        </Link>

        {/* Menu Navigasi Tengah (1:1 dengan landing.jpg) */}
        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Navigasi Utama"
        >
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="group relative py-6 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:font-semibold [&.active]:text-[#173b32] dark:[&.active]:text-foreground"
          >
            <span>Beranda</span>
            <span className="absolute bottom-0 left-0 hidden h-0.5 w-full bg-[#173b32] transition-all group-[.active]:block dark:bg-foreground" />
          </Link>

          <Link
            to="/lapor"
            className="group relative py-6 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:font-semibold [&.active]:text-[#173b32] dark:[&.active]:text-foreground"
          >
            <span>Lapor Insiden</span>
            <span className="absolute bottom-0 left-0 hidden h-0.5 w-full bg-[#173b32] transition-all group-[.active]:block dark:bg-foreground" />
          </Link>

          <a
            href="#news"
            className="group relative py-6 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <span>News</span>
          </a>
        </nav>

        {/* Tombol Aksi Kanan (1:1 dengan landing.jpg: Sign In & Sign Up) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            to="/lapor"
            className={buttonVariants({ variant: 'outline-ember', size: 'sm' })}
          >
            Sign In
          </Link>

          <Link
            to="/lapor"
            className={buttonVariants({ variant: 'ember', size: 'sm' })}
          >
            Sign Up
          </Link>

          <div className="ml-1 flex items-center border-l border-border pl-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
