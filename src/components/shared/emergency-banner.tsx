import * as React from 'react'
import { PhoneCallIcon, ShieldAlertIcon, XIcon } from 'lucide-react'

/**
 * Banner darurat keselamatan publik di bagian atas antarmuka.
 * Mengarahkan warga dalam kondisi bahaya langsung ke kontak darurat resmi (113 & 112).
 */
export function EmergencyBanner() {
  const [isDismissed, setIsDismissed] = React.useState(false)

  if (isDismissed) {
    return null
  }

  return (
    <aside
      aria-label="Peringatan Darurat Keselamatan"
      className="relative z-30 w-full border-b border-[#fee4e2] bg-[#fef3f2] px-4 py-2 text-xs text-[#b42318] transition-all sm:text-sm dark:border-[#521c16] dark:bg-[#281311] dark:text-[#fca5a5]"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 sm:px-2">
        {/* Pesan Keselamatan */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <ShieldAlertIcon
            className="size-4 shrink-0 text-[var(--color-danger)]"
            aria-hidden="true"
          />
          <p className="text-xs sm:text-sm">
            <span className="font-semibold">Peringatan keselamatan:</span> Jika
            kebakaran sangat mengancam keselamatan diri, segera hubungi{' '}
            <strong className="font-bold underline decoration-1">113</strong>{' '}
            atau{' '}
            <strong className="font-bold underline decoration-1">112</strong>,
            sebelum membuat laporan daring
          </p>
        </div>

        {/* Tombol Dial Darurat & Tombol Tutup */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a
            href="tel:113"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#b42318]/30 bg-white/80 px-2.5 py-1 text-xs font-semibold text-[#b42318] shadow-2xs transition-colors hover:border-[#b42318] hover:bg-white dark:bg-black/30 dark:text-[#fca5a5]"
            aria-label="Panggil Dinas Pemadam Kebakaran 113"
          >
            <PhoneCallIcon className="size-3" aria-hidden="true" />
            <span>Damkar (113)</span>
          </a>

          <a
            href="tel:112"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#b42318]/30 bg-white/80 px-2.5 py-1 text-xs font-semibold text-[#b42318] shadow-2xs transition-colors hover:border-[#b42318] hover:bg-white dark:bg-black/30 dark:text-[#fca5a5]"
            aria-label="Panggil Layanan Panggilan Darurat Nasional 112"
          >
            <PhoneCallIcon className="size-3" aria-hidden="true" />
            <span>Darurat (112)</span>
          </a>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="ml-1 inline-flex size-6 items-center justify-center rounded-full text-[#b42318]/70 transition-colors hover:bg-[#b42318]/10 hover:text-[#b42318] dark:text-[#fca5a5]/80"
            aria-label="Tutup pemberitahuan darurat"
          >
            <XIcon className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  )
}
