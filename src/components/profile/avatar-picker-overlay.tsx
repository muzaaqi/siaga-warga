import { CheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRESET_AVATARS } from '@/lib/schema/profile'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  ResponsiveOverlay,
  ResponsiveOverlayContent,
} from '@/components/ui/responsive-overlay'

interface AvatarPickerOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (avatarPath: string) => void
  currentAvatar?: string | null
}

export function AvatarPickerOverlay({
  open,
  onOpenChange,
  onSelect,
  currentAvatar,
}: AvatarPickerOverlayProps) {
  return (
    <ResponsiveOverlay open={open} onOpenChange={onOpenChange}>
      <ResponsiveOverlayContent
        title="Pilih Avatar Taktis"
        description="Pilih salah satu avatar preset SiagaWarga yang mewakili peran Anda dalam mitigasi kebakaran."
        className="max-w-md"
      >
        <div
          className="my-3 grid grid-cols-3 gap-3"
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
                onClick={() => {
                  onSelect(avatar.path)
                  onOpenChange(false)
                }}
                className={cn(
                  'group relative flex cursor-pointer flex-col items-center rounded-lg p-2 transition-all hover:bg-muted/50',
                  isSelected &&
                    'bg-[var(--color-pine)]/10 ring-2 ring-[var(--color-pine)]',
                )}
              >
                <div className="relative">
                  <Avatar size="xl">
                    <AvatarImage src={avatar.path} alt={avatar.name} />
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/35">
                      <CheckIcon className="size-5 text-white drop-shadow-sm" />
                    </div>
                  )}
                </div>
                <p className="mt-2 line-clamp-1 text-center text-xs font-semibold text-foreground">
                  {avatar.name}
                </p>
                <p className="line-clamp-1 text-center text-[10px] text-muted-foreground">
                  {avatar.description}
                </p>
              </button>
            )
          })}
        </div>
      </ResponsiveOverlayContent>
    </ResponsiveOverlay>
  )
}
