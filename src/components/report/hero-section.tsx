import { Link } from '@tanstack/react-router'
import { ArrowRightIcon, SearchIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-canvas)] pt-12 pb-28 transition-colors sm:pt-16 sm:pb-36 lg:pt-20 lg:pb-48 dark:bg-card/40">
      {/* Full Forest Fire Backdrop on the Right (1:1 dengan landing.jpg) */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-full overflow-hidden lg:w-[60%]">
        <img
          src="/background.jpg"
          alt=""
          className="h-full w-full object-cover object-[right_top]"
        />
        {/* Gradien pemudar halus dari kanvas kiri ke gambar di kanan */}
        <div className="absolute inset-y-0 left-0 w-3/5 bg-gradient-to-r from-[var(--color-canvas)] via-[var(--color-canvas)]/70 to-transparent dark:from-background dark:via-background/70" />
        {/* Gradien lembut atas dan bawah */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-canvas)]/30 via-transparent to-[var(--color-canvas)]/80 dark:from-background/30 dark:to-background/80" />

        {/* Ikon Kaca Pembesar Radar di Kanopi Pohon (persis seperti di landing.jpg) */}
        <div className="absolute top-10 right-1/3 hidden size-8 items-center justify-center rounded-full border border-white/70 bg-white/20 text-white backdrop-blur-xs sm:flex">
          <SearchIcon className="size-4" aria-hidden="true" />
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl leading-[1.15] font-extrabold tracking-tight text-[#173b32] sm:text-5xl lg:text-[56px] dark:text-foreground">
            Pantau dan Verifikasi Laporan{' '}
            <span className="text-[var(--color-ember)]">Kebakaran</span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-[#475467] sm:text-lg dark:text-muted-foreground">
            Laporkan kebakaran hutan, lahan, atau permukiman dengan mudah dan
            aman. SiagaWarga membantu memeriksa laporan melalui validasi lokasi,
            data hotspot satelit, dan verifikasi moderator, serta menyediakan
            pelacakan status laporan secara transparan.
          </p>

          <div className="pt-2">
            <Link
              to="/lapor"
              className={cn(
                buttonVariants({ variant: 'ember', size: 'xl' }),
                'group',
              )}
            >
              <span>Lapor Kebakaran</span>
              <ArrowRightIcon
                className="size-5 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Lengkungan Bawah Organik (Convex Arc yang memotong dasar hero persis 1:1) */}
      <div className="pointer-events-none absolute right-0 -bottom-px left-0 h-16 w-full overflow-hidden text-background sm:h-20 lg:h-24">
        <svg
          viewBox="0 0 1440 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            d="M0,0 C360,75 1080,75 1440,0 L1440,96 L0,96 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  )
}
