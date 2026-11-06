import * as React from 'react'
import { AlertCircleIcon } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  ResponsiveOverlay,
  ResponsiveOverlayContent,
} from '@/components/ui/responsive-overlay'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { updateReportStatus } from '@/server/functions/moderator'

interface StatusChangeDialogProps {
  reportId: string
  currentVerification: string
  currentHandling: string
  currentPriority: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

type StatusType = 'verification' | 'handling' | 'priority'

export function StatusChangeDialog({
  reportId,
  currentVerification,
  currentHandling,
  currentPriority,
  open,
  onOpenChange,
  onSuccess,
}: StatusChangeDialogProps) {
  const [statusType, setStatusType] = React.useState<StatusType>('verification')
  const [newValue, setNewValue] = React.useState(currentVerification)
  const [reasonNote, setReasonNote] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Reset target value when switching dimension
  React.useEffect(() => {
    if (statusType === 'verification') {
      setNewValue(currentVerification)
    } else if (statusType === 'handling') {
      setNewValue(currentHandling)
    } else {
      setNewValue(currentPriority)
    }
    setErrorMessage(null)
  }, [statusType, currentVerification, currentHandling, currentPriority])

  const dimensionOptions: Array<{ value: StatusType; label: string }> = [
    { value: 'verification', label: 'Verifikasi Bukti' },
    { value: 'handling', label: 'Penanganan Lapangan' },
    { value: 'priority', label: 'Tingkat Prioritas' },
  ]

  const valueOptionsMap: Record<
    StatusType,
    Array<{ value: string; label: string; desc: string }>
  > = {
    verification: [
      {
        value: 'pending',
        label: 'Menunggu',
        desc: 'Belum ditinjau verifikator',
      },
      {
        value: 'needs_review',
        label: 'Perlu Tinjauan',
        desc: 'Terdapat anomali atau butuh konfirmasi',
      },
      {
        value: 'verified',
        label: 'Terverifikasi',
        desc: 'Bukti valid & selaras dengan kondisi lapangan',
      },
      {
        value: 'insufficient_evidence',
        label: 'Bukti Kurang',
        desc: 'Foto buram atau tidak menunjukkan api nyata',
      },
      {
        value: 'rejected',
        label: 'Ditolak / Hoaks',
        desc: 'Laporan palsu atau salah kategori',
      },
    ],
    handling: [
      {
        value: 'not_forwarded',
        label: 'Belum Diteruskan',
        desc: 'Belum disampaikan ke BPBD/Damkar',
      },
      {
        value: 'forwarded',
        label: 'Diteruskan',
        desc: 'Telah dikirimkan ke dinas pemadam setempat',
      },
      {
        value: 'acknowledged',
        label: 'Dikonfirmasi',
        desc: 'Diterima oleh petugas piket dinas',
      },
      {
        value: 'in_progress',
        label: 'Operasi Berlangsung',
        desc: 'Armada pemadam sedang menangani di lokasi',
      },
      {
        value: 'resolved',
        label: 'Selesai / Teratasi',
        desc: 'Api padam dan pendinginan tuntas',
      },
    ],
    priority: [
      {
        value: 'high',
        label: 'Mendesak',
        desc: 'Dekat permukiman padat atau api besar',
      },
      {
        value: 'normal',
        label: 'Normal',
        desc: 'Kebakaran lahan standar terbuka',
      },
      {
        value: 'low',
        label: 'Rendah',
        desc: 'Sisa asap tipis atau terkendali',
      },
    ],
  }

  const currentValueOptions = valueOptionsMap[statusType]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage(null)

    if (reasonNote.trim().length < 10) {
      setErrorMessage(
        'Catatan alasan verifikasi minimal 10 karakter wajib diisi untuk akuntabilitas audit.',
      )
      return
    }

    setIsSubmitting(true)

    try {
      await updateReportStatus({
        data: {
          reportId,
          statusType,
          newValue,
          reasonNote: reasonNote.trim(),
        },
      })

      setReasonNote('')
      onOpenChange(false)
      onSuccess()
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Gagal memperbarui status laporan.'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ResponsiveOverlay open={open} onOpenChange={onOpenChange}>
      <ResponsiveOverlayContent
        title="Ubah Status Laporan"
        description="Perubahan status akan dicatat secara permanen pada linimasa audit dengan identitas akun moderator Anda."
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {/* 1. Pilih Dimensi Status */}
          <Field>
            <FieldLabel>Dimensi Status:</FieldLabel>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {dimensionOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatusType(opt.value)}
                  className={`rounded-md border p-2 text-center text-xs font-medium transition-colors ${
                    statusType === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          {/* 2. Pilih Nilai Status Baru */}
          <Field>
            <FieldLabel>Nilai Status Baru:</FieldLabel>
            <div className="flex flex-col gap-1.5 pt-1">
              {currentValueOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setNewValue(opt.value)}
                  className={`flex flex-col items-start rounded-lg border p-2.5 text-left transition-all ${
                    newValue === opt.value
                      ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="text-xs font-semibold text-foreground sm:text-sm">
                    {opt.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </Field>

          {/* 3. Catatan Alasan Verifikasi */}
          <Field>
            <FieldLabel>Catatan Alasan Verifikasi (Wajib):</FieldLabel>
            <Textarea
              value={reasonNote}
              onChange={(e) => setReasonNote(e.target.value)}
              placeholder="Contoh: Bukti foto telah dikonfirmasi selaras dengan titik panas satelit NASA VIIRS, penanganan telah dikoordinasikan ke BPBD."
              rows={3}
              className="mt-1"
            />
            <span className="text-[11px] text-muted-foreground">
              Minimal 10 karakter. Tersisa:{' '}
              {Math.max(0, 10 - reasonNote.trim().length)} karakter lagi.
            </span>
          </Field>

          {/* Tombol Aksi */}
          <div className="mt-2 flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isSubmitting || reasonNote.trim().length < 10}
            >
              {isSubmitting ? <Spinner className="size-4" /> : null}
              <span>Simpan Perubahan</span>
            </Button>
          </div>
        </form>
      </ResponsiveOverlayContent>
    </ResponsiveOverlay>
  )
}
