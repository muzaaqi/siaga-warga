import * as React from 'react'
import { PhoneCallIcon, ShieldAlertIcon, XIcon } from 'lucide-react'

/**
 * Banner darurat keselamatan publik di bagian atas antarmuka.
 * Mengarahkan warga dalam kondisi bahaya langsung ke kontak darurat resmi (113 & 112).
 * Dioptimalkan secara responsif untuk layar ponsel pintar (< 640px) dan desktop/tablet.
 */
export function EmergencyBanner() {
  const [isDismissed, setIsDismissed] = React.useState(false)

  if (isDismissed) {
    return null
  }

  return (
    <aside
      aria-label="Peringatan Darurat Keselamatan"
      className="relative z-30 w-full border-b border-destructive/20 bg-destructive/10 text-xs text-destructive transition-all sm:text-sm dark:border-destructive/30 dark:bg-destructive/15 dark:text-red-300"
    >
      <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-4 sm:py-2">
        {/* Tampilan Desktop & Tablet (sm:flex) - Tata letak horizontal 1 baris */}
        <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <ShieldAlertIcon
              className="size-4 shrink-0 text-destructive dark:text-red-400"
              aria-hidden="true"
            />
            <p className="text-xs sm:text-sm">
              <span className="font-semibold">Peringatan keselamatan:</span>{' '}
              Jika kebakaran sangat mengancam keselamatan diri, segera hubungi{' '}
              <strong className="font-bold underline decoration-1">113</strong>{' '}
              atau{' '}
              <strong className="font-bold underline decoration-1">112</strong>{' '}
              sebelum membuat laporan daring.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href="tel:113"
              className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-background/90 px-3 py-1 text-xs font-semibold text-destructive shadow-2xs transition-colors hover:border-destructive hover:bg-background dark:bg-card dark:text-red-300 dark:hover:bg-card/80"
              aria-label="Panggil Dinas Pemadam Kebakaran 113"
            >
              <PhoneCallIcon className="size-3" aria-hidden="true" />
              <span>Damkar (113)</span>
            </a>

            <a
              href="tel:112"
              className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-background/90 px-3 py-1 text-xs font-semibold text-destructive shadow-2xs transition-colors hover:border-destructive hover:bg-background dark:bg-card dark:text-red-300 dark:hover:bg-card/80"
              aria-label="Panggil Layanan Panggilan Darurat Nasional 112"
            >
              <PhoneCallIcon className="size-3" aria-hidden="true" />
              <span>Darurat (112)</span>
            </a>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="ml-1 inline-flex size-6 items-center justify-center rounded-full text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive dark:text-red-300/70 dark:hover:bg-destructive/20"
              aria-label="Tutup pemberitahuan darurat"
            >
              <XIcon className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Tampilan Ponsel Pintar (< sm:block) - Tata letak 2 baris terstruktur rapi */}
        <div className="flex flex-col gap-2 sm:hidden">
          {/* Baris 1: Ikon peringatan + Teks + Tombol Tutup di pojok kanan atas */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <ShieldAlertIcon
                className="mt-0.5 size-4 shrink-0 text-destructive dark:text-red-400"
                aria-hidden="true"
              />
              <p className="text-xs leading-snug">
                <span className="font-semibold">
                  Bahaya Kebakaran Mengancam?
                </span>{' '}
                Segera hubungi nomor darurat sebelum membuat laporan daring:
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="-mt-0.5 -mr-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive dark:text-red-300/70 dark:hover:bg-destructive/20"
              aria-label="Tutup pemberitahuan darurat"
            >
              <XIcon className="size-4" aria-hidden="true" />
            </button>
          </div>

          {/* Baris 2: Dua tombol panggilan cepat touch-friendly 2 kolom seimbang */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <a
              href="tel:113"
              className="flex items-center justify-center gap-1.5 rounded-md border border-destructive/30 bg-background/95 py-2 text-xs font-semibold text-destructive shadow-2xs transition-colors active:bg-destructive/10 dark:bg-card dark:text-red-300"
              aria-label="Panggil Dinas Pemadam Kebakaran 113"
            >
              <PhoneCallIcon className="size-3.5 shrink-0" aria-hidden="true" />
              <span>Damkar 113</span>
            </a>

            <a
              href="tel:112"
              className="flex items-center justify-center gap-1.5 rounded-md border border-destructive/30 bg-background/95 py-2 text-xs font-semibold text-destructive shadow-2xs transition-colors active:bg-destructive/10 dark:bg-card dark:text-red-300"
              aria-label="Panggil Layanan Panggilan Darurat Nasional 112"
            >
              <PhoneCallIcon className="size-3.5 shrink-0" aria-hidden="true" />
              <span>Darurat 112</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}
