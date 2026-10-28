import { Link, useLocation } from '@tanstack/react-router'
import {
  FlameIcon,
  HomeIcon,
  LogInIcon,
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

            <a
              href="#news"
              className="group relative py-6 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>News</span>
            </a>
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
                        render={<a href="/admin/triase" />}
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
                <LogInIcon className="size-4" />
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

          <MenuDockItem value="news" render={<a href="#news" />}>
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
