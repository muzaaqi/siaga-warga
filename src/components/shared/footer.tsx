import { ShieldCheckIcon, PhoneIcon } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-16 w-full border-t border-border bg-card py-10 text-card-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2 font-bold text-foreground">
              <span className="text-base tracking-tight">SiagaWarga</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Platform partisipasi publik pemantauan kebakaran hutan, lahan, dan
              permukiman di Indonesia. Mengintegrasikan verifikasi multi-tahap
              dan validasi data satelit NASA FIRMS.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold tracking-wider text-foreground uppercase">
              Jaminan Privasi & Keamanan
            </h4>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheckIcon
                className="mt-0.5 size-4 shrink-0 text-[var(--success)]"
                aria-hidden="true"
              />
              <span>
                <strong>Prinsip Nol Kebocoran PII:</strong> Nomor telepon dan
                koordinat presisi pelapor dilindungi secara ketat. Peta publik
                hanya menyajikan estimasi wilayah tingkat kelurahan.
              </span>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold tracking-wider text-foreground uppercase">
              Kontak Darurat Resmi
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <PhoneIcon
                  className="size-3.5 text-primary"
                  aria-hidden="true"
                />
                <span>
                  <strong>113:</strong> Dinas Pemadam Kebakaran dan Penyelamatan
                </span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneIcon
                  className="size-3.5 text-primary"
                  aria-hidden="true"
                />
                <span>
                  <strong>112:</strong> Layanan Panggilan Darurat Nasional
                  (Bebas Pulsa)
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            Dikembangkan untuk Web In Action (WIA) — Multimedia In Action 2026.
            Subtema: Public Service Tracking.
          </p>
          <p>Hak Cipta © 2026 Tim SiagaWarga. Seluruh hak cipta dilindungi.</p>
        </div>
      </div>
    </footer>
  )
}
