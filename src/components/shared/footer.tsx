import {
  FlameIcon,
  ShieldCheckIcon,
  PhoneCallIcon,
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
  FacebookIcon,
} from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full bg-[#0B3B2C] text-emerald-50 dark:bg-[#07241B]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Col 1: Brand & Socials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-md bg-[#EA580C] text-white shadow-xs">
                <FlameIcon className="size-4.5" aria-hidden="true" />
              </span>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Siaga<span className="text-[#EA580C]">Warga</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-emerald-100/80">
              Platform partisipasi publik untuk pemantauan kebakaran hutan,
              lahan, dan permukiman di Indonesia. Mendukung penanganan lebih
              cepat berbasis data terbuka dan teknologi satelit.
            </p>
            <div className="flex items-center gap-3 pt-2 text-emerald-200">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram SiagaWarga"
                className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20 hover:text-white"
              >
                <InstagramIcon className="size-4" aria-hidden="true" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X (Twitter) SiagaWarga"
                className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20 hover:text-white"
              >
                <TwitterIcon className="size-4" aria-hidden="true" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube SiagaWarga"
                className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20 hover:text-white"
              >
                <YoutubeIcon className="size-4" aria-hidden="true" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook SiagaWarga"
                className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20 hover:text-white"
              >
                <FacebookIcon className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Col 2: Jaminan Privasi & Keamanan */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-emerald-300 uppercase">
              Jaminan Privasi & Keamanan
            </h4>
            <div className="flex items-start gap-3 rounded-lg border border-emerald-800/60 bg-emerald-900/30 p-3.5 text-xs text-emerald-100/90">
              <ShieldCheckIcon
                className="mt-0.5 size-5 shrink-0 text-emerald-400"
                aria-hidden="true"
              />
              <span className="leading-relaxed">
                <strong>Prinsip Perlindungan Privasi PII:</strong> Nomor telepon
                dan koordinat presisi pelapor dilindungi secara ketat. Peta
                publik hanya menyajikan estimasi wilayah tingkat kelurahan.
              </span>
            </div>
          </div>

          {/* Col 3: Kontak Darurat Resmi */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-emerald-300 uppercase">
              Kontak Darurat Resmi
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="tel:113"
                  className="flex items-center gap-3 rounded-lg border border-emerald-800/60 bg-emerald-900/30 p-3 text-emerald-100 transition-colors hover:bg-emerald-900/50 hover:text-white"
                >
                  <PhoneCallIcon
                    className="size-4 text-[#EA580C]"
                    aria-hidden="true"
                  />
                  <div>
                    <span className="font-bold text-white">113:</span> Dinas
                    Pemadam Kebakaran dan Penyelamatan
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="tel:112"
                  className="flex items-center gap-3 rounded-lg border border-emerald-800/60 bg-emerald-900/30 p-3 text-emerald-100 transition-colors hover:bg-emerald-900/50 hover:text-white"
                >
                  <PhoneCallIcon
                    className="size-4 text-[#EA580C]"
                    aria-hidden="true"
                  />
                  <div>
                    <span className="font-bold text-white">112:</span> Layanan
                    Panggilan Darurat Nasional (Bebas Pulsa)
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-emerald-800/60 pt-6 text-xs text-emerald-200/70 sm:flex-row">
          <p>
            Dikembangkan untuk Web In Action (WIA) 2026. Subtema: Public Service
            Tracking.
          </p>
          <div className="flex flex-wrap items-center gap-6">
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
