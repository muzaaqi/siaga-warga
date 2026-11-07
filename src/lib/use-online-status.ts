import { useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getSnapshot(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

function getServerSnapshot(): boolean {
  return true // SSR selalu mengasumsikan online untuk mencegah perbedaan hidrasi
}

/**
 * Hook reaktif untuk mendeteksi status konektivitas jaringan peramban
 * menggunakan React 19 useSyncExternalStore (SSR-safe).
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
