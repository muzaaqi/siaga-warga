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
      className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/50 p-4 duration-200 fade-in-0"
      role="dialog"
      aria-modal="true"
      aria-label="Pilih Avatar"
    >
      <div className="relative w-full max-w-md animate-in rounded-xl border border-border bg-card p-6 shadow-xl duration-200 zoom-in-95">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Pilih Avatar Taktis
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Tutup pemilih avatar"
          >
            <XIcon className="size-4" />
          </Button>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          Pilih salah satu avatar preset SiagaWarga yang mewakili peran Anda
          dalam mitigasi kebakaran hutan dan lahan.
        </p>

        <div
          className="mb-4 grid grid-cols-3 gap-3"
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
                  'group relative cursor-pointer transition-all',
                  'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none',
                  isSelected &&
                    'ring-2 ring-[var(--color-pine)] ring-offset-2 ring-offset-card',
                )}
              >
                <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
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
                <p className="mt-1.5 line-clamp-1 text-center text-xs font-medium text-foreground">
                  {avatar.name}
                </p>
                <p className="line-clamp-1 text-center text-[10px] text-muted-foreground">
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
