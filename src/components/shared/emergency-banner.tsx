import * as React from 'react'
import { PhoneCallIcon, ShieldAlertIcon, XIcon } from 'lucide-react'

/**
 * Banner darurat di bagian teratas viewport.
 * Menghubungkan warga dalam kondisi bahaya langsung ke kontak tanggap darurat
 * (113 Damkar & 112 Panggilan Darurat Nasional) sebelum mengisi laporan daring.
 */
export function EmergencyBanner() {
  const [dismissed, setDismissed] = React.useState(false)

  if (dismissed) {
    return null
  }

  return (
    <aside
      aria-label="Peringatan Darurat Keselamatan"
      className="sticky top-0 z-50 w-full border-b border-orange-200/80 bg-[#FFF5F1] px-4 py-2 text-xs font-medium text-[#7A271A] shadow-xs md:text-sm dark:border-orange-950/70 dark:bg-[#231510] dark:text-[#FCA5A5]"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlertIcon
            className="size-4 shrink-0 text-[#C2410C] dark:text-[#FB923C]"
            aria-hidden="true"
          />
          <span>
            <strong>Peringatan Keselamatan:</strong> Jika kebakaran sangat
            mengancam keselamatan diri, segera hubungi <strong>113</strong> atau{' '}
            <strong>112</strong> sebelum membuat laporan daring.
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a
            href="tel:113"
            className="inline-flex items-center gap-1.5 rounded-full border border-orange-300/80 bg-white/80 px-3 py-0.5 text-xs font-semibold text-[#7A271A] transition-colors hover:bg-white dark:border-orange-800/80 dark:bg-black/40 dark:text-[#FCA5A5] dark:hover:bg-black/60"
          >
            <PhoneCallIcon className="size-3.5" aria-hidden="true" />
            <span>Damkar (113)</span>
          </a>
          <a
            href="tel:112"
            className="inline-flex items-center gap-1.5 rounded-full border border-orange-300/80 bg-white/80 px-3 py-0.5 text-xs font-semibold text-[#7A271A] transition-colors hover:bg-white dark:border-orange-800/80 dark:bg-black/40 dark:text-[#FCA5A5] dark:hover:bg-black/60"
          >
            <PhoneCallIcon className="size-3.5" aria-hidden="true" />
            <span>Darurat (112)</span>
          </a>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Tutup peringatan keselamatan"
            className="ml-1 rounded p-1 text-[#7A271A]/80 transition-colors hover:bg-black/5 hover:text-[#7A271A] dark:text-[#FCA5A5]/80 dark:hover:bg-white/10 dark:hover:text-[#FCA5A5]"
          >
            <XIcon className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  )
}
