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
import type { AdminUserItem, UserRole } from '@/lib/schema/admin-users'
import { changeUserRole } from '@/server/functions/admin-users'

interface RoleChangeDialogProps {
  user: AdminUserItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (updatedUser: AdminUserItem) => void
}

export function RoleChangeDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: RoleChangeDialogProps) {
  const [selectedRole, setSelectedRole] = React.useState<UserRole>(
    user?.role ?? 'citizen',
  )
  const [reasonNote, setReasonNote] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (user) {
      setSelectedRole(user.role)
      setReasonNote('')
      setErrorMessage(null)
    }
  }, [user])

  const roleOptions: Array<{
    value: UserRole
    label: string
    description: string
  }> = [
    {
      value: 'citizen',
      label: 'Warga Pelapor',
      description: 'Akses standar pelaporan insiden dan pemantauan publik.',
    },
    {
      value: 'moderator',
      label: 'Petugas Verifikator',
      description:
        'Akses ke dasbor triase, peninjauan bukti kejadian, dan pembaruan status.',
    },
    {
      value: 'superadmin',
      label: 'Administrator Utama',
      description:
        'Otoritas penuh tata kelola peran pengguna dan pengawasan sistem.',
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (reasonNote.trim().length < 10) {
      setErrorMessage('Catatan alasan mutasi peran minimal 10 karakter.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await changeUserRole({
        data: {
          targetUserId: user.id,
          newRole: selectedRole,
          reasonNote: reasonNote.trim(),
        },
      })

      onSuccess(res.updatedUser)
      onOpenChange(false)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat memperbarui peran akun.'
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <ResponsiveOverlay open={open} onOpenChange={onOpenChange}>
      <ResponsiveOverlayContent
        title="Ubah Peran Pengguna"
        description={`Tetapkan hak akses operasional untuk akun ${user.name} (${user.email}).`}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertCircleIcon className="size-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {/* Pemilihan Peran Baru */}
          <div className="flex flex-col gap-2">
            <FieldLabel>Pilih Peran Baru</FieldLabel>
            <div className="flex flex-col gap-2">
              {roleOptions.map((opt) => {
                const isSelected = selectedRole === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSelectedRole(opt.value)
                      setErrorMessage(null)
                    }}
                    className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                        : 'border-border/60 bg-card text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-sm font-semibold">{opt.label}</span>
                      {isSelected ? (
                        <span className="text-[11px] font-medium text-primary">
                          Terpilih
                        </span>
                      ) : null}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {opt.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Masukan Catatan Alasan */}
          <Field>
            <FieldLabel htmlFor="role-reason-note">
              Catatan Alasan Perubahan Peran (Wajib)
            </FieldLabel>
            <Textarea
              id="role-reason-note"
              value={reasonNote}
              onChange={(e) => {
                setReasonNote(e.target.value)
                if (errorMessage) setErrorMessage(null)
              }}
              placeholder="Jelaskan alasan penugasan atau perubahan wewenang akun ini (minimal 10 karakter)..."
              rows={3}
              className="resize-none"
              required
            />
            <span className="text-[11px] text-muted-foreground">
              {reasonNote.trim().length}/10 karakter minimal
            </span>
          </Field>

          {/* Tombol Aksi */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batalkan
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || reasonNote.trim().length < 10}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="size-4" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Peran</span>
              )}
            </Button>
          </div>
        </form>
      </ResponsiveOverlayContent>
    </ResponsiveOverlay>
  )
}
