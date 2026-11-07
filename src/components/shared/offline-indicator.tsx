import { useEffect, useRef, useState } from 'react'
import {
  RotateCcwIcon,
  WifiIcon,
  WifiOffIcon,
  XIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useOnlineStatus } from '@/lib/use-online-status'

export function OfflineIndicator() {
  const isOnline = useOnlineStatus()
  const [showRestored, setShowRestored] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const prevOnlineRef = useRef(isOnline)

  useEffect(() => {
    // Deteksi transisi dari offline -> online
    if (!prevOnlineRef.current && isOnline) {
      setShowRestored(true)
      setIsDismissed(false)
      const timer = setTimeout(() => {
        setShowRestored(false)
      }, 3500)
      return () => clearTimeout(timer)
    }

    if (!isOnline) {
      setIsDismissed(false)
    }

    prevOnlineRef.current = isOnline
  }, [isOnline])

  const handleCheckConnection = () => {
    if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
      if (window.navigator.onLine) {
        setShowRestored(true)
        setIsDismissed(false)
      }
    }
  }

  // Jika online dan tidak sedang menampilkan banner pemulihan, sembunyikan
  if (isOnline && !showRestored) {
    return null
  }

  // Jika pengguna menutup banner offline secara manual
  if (isDismissed && !showRestored) {
    return null
  }

  // Kondisi 1: Sinyal Pulih Kembali
  if (isOnline && showRestored) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="relative z-40 border-b border-[var(--success)]/30 bg-[var(--success)]/10 px-4 py-2 text-foreground transition-all duration-300"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-[var(--success)]/20 text-[var(--success)]">
              <WifiIcon className="size-3.5" />
            </div>
            <div>
              <span className="font-semibold text-foreground">
                Koneksi Terhubung Kembali:
              </span>{' '}
              <span className="text-muted-foreground">
                Sinyal internet aktif. Seluruh fitur pelaporan dan pemantauan siap digunakan kembali.
              </span>
            </div>
          </div>
          <Badge variant="success" size="xs">
            <span>Online</span>
          </Badge>
        </div>
      </div>
    )
  }

  // Kondisi 2: Terputus / Luar Jaringan (Offline)
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="relative z-40 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-foreground transition-all duration-300"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <WifiOffIcon className="size-4" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">
                Koneksi Terputus
              </span>
              <Badge variant="warning" size="xs">
                <span>Mode Offline</span>
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Anda sedang berada dalam mode luar jaringan (offline). Fitur pengiriman laporan dan sinkronisasi peta satelit membutuhkan koneksi internet aktif.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="outline"
            onClick={handleCheckConnection}
          >
            <RotateCcwIcon className="size-3" />
            <span>Periksa Sambungan</span>
          </Button>

          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => setIsDismissed(true)}
            aria-label="Tutup notifikasi offline"
          >
            <XIcon className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
