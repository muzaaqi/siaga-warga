import { Link, useLocation } from '@tanstack/react-router'
import {
  FlameIcon,
  HomeIcon,
  LogOutIcon,
  NewspaperIcon,
  ShieldCheckIcon,
  FileTextIcon,
} from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { Button } from '@/components/ui/button'
import {
  MenuDock,
  MenuDockItem,
  MenuDockIcon,
  MenuDockLabel,
} from '@/components/ui/menu-dock'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signIn, signOut, useSession } from '@/lib/auth-client'

function GoogleIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  )
}

export function HeaderNav() {
  const location = useLocation()
  const { data: session } = useSession()

  const currentTab =
    location.pathname === '/'
      ? 'home'
      : location.pathname.startsWith('/lapor')
        ? 'lapor'
        : 'home'

  const user = session?.user as
    | {
        name?: string | null
        email?: string | null
        image?: string | null
        role?: string | null
      }
    | undefined

  const handleSignIn = async () => {
    await signIn.social({
      provider: 'google',
      callbackURL: typeof window !== 'undefined' ? window.location.href : '/',
    })
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'
  const isModerator = user?.role === 'moderator' || user?.role === 'superadmin'

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-card/95 backdrop-blur-xs transition-colors dark:border-border dark:bg-card/90">
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

          {/* Navigasi Utama Navbar untuk Tablet & Desktop (md:flex) */}
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

            <Link
              to="/"
              hash="news"
              className="group relative py-6 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>News</span>
            </Link>
          </nav>

          {/* Tombol Aksi Kanan: 1-Click Masuk OAuth / Profil Avatar & ThemeToggle */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger aria-label="Menu Akun Pengguna">
                  <Avatar className="size-9">
                    {user.image && (
                      <AvatarImage
                        src={user.image}
                        alt={user.name ?? 'Foto Profil'}
                      />
                    )}
                    <AvatarFallback>{userInitial}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm leading-none font-semibold text-foreground">
                        {user.name ?? 'Pengguna'}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email ?? ''}
                      </p>
                      {isModerator && (
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-[var(--color-pine)]/10 px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-pine)]">
                          <ShieldCheckIcon className="size-3" />
                          Petugas
                        </span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem render={<Link to="/lapor" />}>
                      <FileTextIcon />
                      <span>Laporan Saya</span>
                    </DropdownMenuItem>
                    {isModerator && (
                      <DropdownMenuItem
                        variant="primary"
                        render={<Link to="/admin/triase" />}
                      >
                        <ShieldCheckIcon />
                        <span>Dasbor Triase</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleSignOut}
                  >
                    <LogOutIcon />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ember"
                size="sm"
                onClick={handleSignIn}
                aria-label="Masuk dengan Google"
              >
                <GoogleIcon className="size-4 text-white" />
                <span>Masuk</span>
              </Button>
            )}

            <div className="ml-1 flex items-center border-l border-border pl-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Navigasi Khusus Perangkat Mobile (Smartphone: md:hidden) menggunakan MenuDock */}
      <div
        className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 md:hidden"
        aria-label="Navigasi Bergerak Mobile"
      >
        <MenuDock value={currentTab} size="sm">
          <MenuDockItem
            value="home"
            render={<Link to="/" activeOptions={{ exact: true }} />}
          >
            <MenuDockIcon>
              <HomeIcon />
            </MenuDockIcon>
            <MenuDockLabel>Beranda</MenuDockLabel>
          </MenuDockItem>

          <MenuDockItem value="lapor" render={<Link to="/lapor" />}>
            <MenuDockIcon>
              <FlameIcon />
            </MenuDockIcon>
            <MenuDockLabel>Lapor</MenuDockLabel>
          </MenuDockItem>

          <MenuDockItem value="news" render={<Link to="/" hash="news" />}>
            <MenuDockIcon>
              <NewspaperIcon />
            </MenuDockIcon>
            <MenuDockLabel>News</MenuDockLabel>
          </MenuDockItem>
        </MenuDock>
      </div>
    </>
  )
}
