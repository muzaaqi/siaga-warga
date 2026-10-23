import { PhoneCallIcon, ShieldAlertIcon } from 'lucide-react'

/**
 * Banner darurat statis di bagian paling atas viewport.
 * Memastikan warga dalam kondisi bahaya langsung diarahkan ke kontak tanggap darurat
 * (113 Damkar & 112 Panggilan Darurat Nasional) sebelum mengisi laporan daring.
 */
export function EmergencyBanner() {
  return (
    <aside
      aria-label="Peringatan Darurat Keselamatan"
      className="sticky top-0 z-50 w-full border-b border-destructive/30 bg-destructive px-4 py-2 text-xs font-medium text-destructive-foreground shadow-sm md:text-sm"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlertIcon
            className="size-4 shrink-0 text-white"
            aria-hidden="true"
          />
          <span>
            <strong>Peringatan Keselamatan:</strong> Jika kebakaran mengancam
            keselamatan jiwa, segera hubungi <strong>113</strong> atau{' '}
            <strong>112</strong> sebelum membuat laporan daring.
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <a
            href="tel:113"
            className="inline-flex items-center gap-1.5 rounded bg-white/20 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/30"
          >
            <PhoneCallIcon className="size-3.5" aria-hidden="true" />
            <span>Damkar (113)</span>
          </a>
          <a
            href="tel:112"
            className="inline-flex items-center gap-1.5 rounded bg-white/20 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/30"
          >
            <PhoneCallIcon className="size-3.5" aria-hidden="true" />
            <span>Darurat (112)</span>
          </a>
        </div>
      </div>
    </aside>
  )
}
