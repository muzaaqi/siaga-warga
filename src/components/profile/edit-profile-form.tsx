'use client'

import * as React from 'react'
import { useRouter } from '@tanstack/react-router'
import { CameraIcon, Loader2Icon, SaveIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { AvatarPickerOverlay } from './avatar-picker-overlay'
import { updateMyProfile } from '@/server/functions/profile'
import { PRESET_AVATARS } from '@/lib/schema/profile'

interface EditProfileFormProps {
  initialName: string
  initialImage: string | null
  onSuccess?: () => void
}

export function EditProfileForm({
  initialName,
  initialImage,
  onSuccess,
}: EditProfileFormProps) {
  const router = useRouter()
  const [name, setName] = React.useState(initialName)
  const [image, setImage] = React.useState<string | null>(initialImage)
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await updateMyProfile({
        data: {
          name: name.trim(),
          image: image ?? undefined,
        },
      })
      onSuccess?.()
      router.invalidate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui profil')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAvatarSelect = (avatarPath: string) => {
    setImage(avatarPath)
    setIsAvatarPickerOpen(false)
  }

  const currentAvatar = PRESET_AVATARS.find((a) => a.path === image)

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error && (
        <div
          data-slot="edit-profile-error"
          className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar size="lg">
            {image && <AvatarImage src={image} alt={name || 'Foto Profil'} />}
            <AvatarFallback>
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute -right-1 -bottom-1"
            onClick={() => setIsAvatarPickerOpen(true)}
            aria-label="Ganti avatar"
            disabled={isSubmitting}
          >
            <CameraIcon className="size-4 text-muted-foreground" />
          </Button>
        </div>

        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Foto Profil</h3>
          <p className="text-sm text-muted-foreground">
            {currentAvatar
              ? `Menggunakan preset: ${currentAvatar.name}`
              : image
                ? 'Menggunakan foto kustom'
                : 'Belum ada foto profil'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-foreground"
        >
          Nama Lengkap
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan nama lengkap"
          maxLength={50}
          minLength={2}
          required
          disabled={isSubmitting}
          aria-describedby="name-hint"
        />
        <p id="name-hint" className="text-xs text-muted-foreground">
          {name.length}/50 karakter (minimal 2 karakter)
        </p>
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.navigate({ to: '/profil' })}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" variant="ember" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <SaveIcon className="size-4" />
              Simpan Perubahan
            </>
          )}
        </Button>
      </div>

      <AvatarPickerOverlay
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        onSelect={handleAvatarSelect}
        currentAvatar={image}
      />
    </form>
  )
}
