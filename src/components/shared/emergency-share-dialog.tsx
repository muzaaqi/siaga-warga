import * as React from 'react'
import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  LinkIcon,
  PhoneCallIcon,
  SendIcon,
  ShieldAlertIcon,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  ResponsiveOverlay,
  ResponsiveOverlayContent,
} from '@/components/ui/responsive-overlay'
import type { EmergencyDispatchPayload } from '@/lib/schema/share'
import {
  copyTextToClipboard,
  generateEmergencyDispatchText,
  generateWhatsAppShareUrl,
} from '@/lib/share'

interface EmergencyShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payload: EmergencyDispatchPayload
}

export function EmergencyShareDialog({
  open,
  onOpenChange,
  payload,
}: EmergencyShareDialogProps) {
  const [copiedText, setCopiedText] = React.useState(false)
  const [copiedLink, setCopiedLink] = React.useState(false)
  const [targetPhone, setTargetPhone] = React.useState('')
  const [showPhoneInput, setShowPhoneInput] = React.useState(false)

  const emergencyText = React.useMemo(() => {
    return generateEmergencyDispatchText(payload)
  }, [payload])

  const trackingUrl = `https://siagawarga.id/lacak/${payload.trackingCode}`

  const handleOpenWhatsApp = () => {
    const url = generateWhatsAppShareUrl(emergencyText, targetPhone)
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleCopyText = async () => {
    const success = await copyTextToClipboard(emergencyText)
    if (success) {
      setCopiedText(true)
      setTimeout(() => setCopiedText(false), 2000)
    }
  }

  const handleCopyLink = async () => {
    const success = await copyTextToClipboard(trackingUrl)
    if (success) {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  return (
    <ResponsiveOverlay open={open} onOpenChange={onOpenChange}>
      <ResponsiveOverlayContent
        title="Bagikan Laporan Darurat"
        description="Teruskan ringkasan laporan resmi ini ke grup WhatsApp warga, posko relawan, atau petugas lapangan."
        className="sm:max-w-lg"
      >
        <div className="space-y-4">
          {/* Pratinjau Teks Pesan Darurat (Format Monospace Bersih) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">Pratinjau Naskah Siaran</span>
              <span>Format Standar WhatsApp</span>
            </div>
            <Card variant="canvas" className="overflow-hidden">
              <CardContent>
                <pre
                  tabIndex={0}
                  aria-label="Pratinjau naskah pesan darurat"
                  className="max-h-48 overflow-y-auto font-mono text-[11px] leading-relaxed whitespace-pre-wrap select-all text-foreground/90 focus:outline-none"
                >
                  {emergencyText}
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* Opsi Pengiriman Nomor Tertentu */}
          <div className="space-y-2">
            {!showPhoneInput ? (
              <button
                type="button"
                onClick={() => setShowPhoneInput(true)}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer"
              >
                <PhoneCallIcon className="size-3.5" aria-hidden="true" />
                <span>Kirim langsung ke nomor WhatsApp kontak/posko tertentu</span>
              </button>
            ) : (
              <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/30 p-2.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="whatsapp-phone-input"
                    className="text-xs font-medium text-foreground"
                  >
                    Nomor WhatsApp Tujuan (Opsional)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPhoneInput(false)
                      setTargetPhone('')
                    }}
                    className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
                <Input
                  id="whatsapp-phone-input"
                  type="tel"
                  variant="mono"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  placeholder="Contoh: 08123456789 atau 628123456789"
                  className="h-8"
                />
                <p className="text-[10px] text-muted-foreground">
                  Kosongkan jika ingin memilih grup atau kontak langsung di aplikasi
                  WhatsApp.
                </p>
              </div>
            )}
          </div>

          {/* Tombol Aksi Utama & Sekunder */}
          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
            >
              {copiedLink ? (
                <>
                  <CheckIcon className="size-3.5 text-[var(--color-pine)]" />
                  <span>Tautan Tersalin!</span>
                </>
              ) : (
                <>
                  <LinkIcon className="size-3.5" />
                  <span>Salin Tautan</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyText}
            >
              {copiedText ? (
                <>
                  <CheckIcon className="size-3.5 text-[var(--color-pine)]" />
                  <span>Teks Tersalin!</span>
                </>
              ) : (
                <>
                  <CopyIcon className="size-3.5" />
                  <span>Salin Teks Lengkap</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ember"
              size="sm"
              onClick={handleOpenWhatsApp}
            >
              <SendIcon className="size-3.5" />
              <span>Buka WhatsApp</span>
              <ExternalLinkIcon className="size-3 opacity-70" />
            </Button>
          </div>

          {/* Penafian Keselamatan & Nomor Panggilan Darurat Resmi */}
          <Alert variant="warning">
            <ShieldAlertIcon className="size-4 shrink-0" />
            <AlertDescription>
              Jika api mengancam keselamatan jiwa dan permukiman warga secara
              langsung, segera hubungi layanan bebas pulsa{' '}
              <strong className="text-foreground">113 (Damkar)</strong> atau{' '}
              <strong className="text-foreground">112 (Panggilan Darurat)</strong>.
            </AlertDescription>
          </Alert>
        </div>
      </ResponsiveOverlayContent>
    </ResponsiveOverlay>
  )
}
