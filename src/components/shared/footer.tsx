import {
  ShieldCheckIcon,
  PhoneCallIcon,
  InstagramIcon,
  YoutubeIcon,
  FacebookIcon,
} from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full bg-[#173b32] text-white selection:bg-white/20 selection:text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 lg:gap-12">
          {/* Kolom 1: Brand & Misi Publik */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="SiagaWarga"
                className="h-8 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-xs leading-relaxed text-white/80 sm:text-sm">
              Platform partisipasi publik untuk pemantauan kebakaran hutan,
              lahan, dan permukiman di Indonesia. Mendukung penanganan lebih
              cepat berbasis data terbuka dan teknologi satelit.
            </p>
            {/* Tautan Media Sosial */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex size-8 items-center justify-center rounded-full bg-white/10 text-white/90 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="Instagram SiagaWarga"
              >
                <InstagramIcon className="size-4" aria-hidden="true" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex size-8 items-center justify-center rounded-full bg-white/10 text-white/90 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="X (Twitter) SiagaWarga"
              >
                <span className="text-xs leading-none font-bold">𝕏</span>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex size-8 items-center justify-center rounded-full bg-white/10 text-white/90 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="YouTube SiagaWarga"
              >
                <YoutubeIcon className="size-4" aria-hidden="true" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex size-8 items-center justify-center rounded-full bg-white/10 text-white/90 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="Facebook SiagaWarga"
              >
                <FacebookIcon className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Kolom 2: Jaminan Privasi & Keamanan (1:1 dengan landing.jpg) */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold tracking-wider text-white/90 uppercase sm:text-sm">
              JAMINAN PRIVASI & KEAMANAN
            </h3>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[oklch(0.72_0.17_150)]">
                <ShieldCheckIcon className="size-4" aria-hidden="true" />
              </span>
              <p className="text-xs leading-relaxed text-white/80 sm:text-sm">
                Prinsip keamanan kebocoran PI. Nomor telepon dan koordinat
                presisi pelapor dilindungi secara ketat. Peta publik hanya
                menyajikan estimasi wilayah tingkat kelurahan.
              </p>
            </div>
          </div>

          {/* Kolom 3: Kontak Darurat Resmi (1:1 dengan landing.jpg) */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold tracking-wider text-white/90 uppercase sm:text-sm">
              KONTAK DARURAT RESMI
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[var(--color-ember)]">
                  <PhoneCallIcon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <a
                    href="tel:113"
                    className="font-bold text-white transition-opacity hover:underline hover:opacity-90"
                    aria-label="Panggil Dinas Pemadam Kebakaran 113"
                  >
                    113
                  </a>
                  <div className="text-xs text-white/75">
                    Dinas Pemadam Kebakaran dan Penyelamatan
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[var(--color-ember)]">
                  <PhoneCallIcon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <a
                    href="tel:112"
                    className="font-bold text-white transition-opacity hover:underline hover:opacity-90"
                    aria-label="Panggil Layanan Panggilan Darurat Nasional 112"
                  >
                    112
                  </a>
                  <div className="text-xs text-white/75">
                    Layanan Panggilan Darurat Nasional (Bebas pulsa)
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Sub-footer Hak Cipta & Legalitas */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#245c4b] pt-6 text-xs text-white/70 sm:flex-row">
          <p>Dikembangkan untuk Web In action 2026</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="cursor-pointer transition-colors hover:text-white">
              Kebijakan Privasi
            </span>
            <span className="cursor-pointer transition-colors hover:text-white">
              Syarat Penggunaan
            </span>
            <span className="cursor-pointer transition-colors hover:text-white">
              Pusat Bantuan
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
