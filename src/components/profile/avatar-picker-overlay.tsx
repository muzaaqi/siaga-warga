import { XIcon, CheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PRESET_AVATARS } from '@/lib/schema/profile'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface AvatarPickerOverlayProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (avatarPath: string) => void
  currentAvatar?: string | null
}

export function AvatarPickerOverlay({
  isOpen,
  onClose,
  onSelect,
  currentAvatar,
}: AvatarPickerOverlayProps) {
  if (!isOpen) return null

  return (
    <div
      data-slot="avatar-picker-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in-0 duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Pilih Avatar"
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Pilih Avatar Taktis</h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Tutup pemilih avatar"
          >
            <XIcon className="size-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Pilih salah satu avatar preset SiagaWarga yang mewakili peran Anda dalam
          mitigasi kebakaran hutan dan lahan.
        </p>

        <div
          className="grid grid-cols-3 gap-3 mb-4"
          role="radiogroup"
          aria-label="Daftar avatar preset"
        >
          {PRESET_AVATARS.map((avatar) => {
            const isSelected = currentAvatar === avatar.path
            return (
              <button
                key={avatar.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${avatar.name}: ${avatar.description}`}
                onClick={() => onSelect(avatar.path)}
                className={cn(
                  'relative group cursor-pointer transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                  isSelected && 'ring-2 ring-[var(--color-pine)] ring-offset-2 ring-offset-card',
                )}
              >
                <div className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                  <Avatar size="lg" className="size-full">
                    <AvatarImage src={avatar.path} alt={avatar.name} />
                    <AvatarFallback>
                      <span className="text-xs font-medium">?</span>
                    </AvatarFallback>
                  </Avatar>
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <CheckIcon className="size-5 text-white drop-shadow-sm" />
                    </div>
                  )}
                </div>
                <p className="mt-1.5 text-center text-xs font-medium text-foreground line-clamp-1">
                  {avatar.name}
                </p>
                <p className="text-center text-[10px] text-muted-foreground line-clamp-1">
                  {avatar.description}
                </p>
              </button>
            )
          })}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
        </div>
      </div>
    </div>
  )
}