import * as React from 'react'
import { useForm } from '@tanstack/react-form'
import {
  CameraIcon,
  CheckIcon,
  PencilIcon,
  ShieldCheckIcon,
  UserIcon,
  XIcon,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import type { MyProfileUser } from '@/lib/schema/profile'
import { updateMyProfile } from '@/server/functions/profile'
import { AvatarPickerOverlay } from './avatar-picker-overlay'

interface ProfileHeaderCardProps {
  user: MyProfileUser
  onProfileUpdated?: () => void
}

export function ProfileHeaderCard({
  user,
  onProfileUpdated,
}: ProfileHeaderCardProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = React.useState(false)
  const [selectedImage, setSelectedImage] = React.useState<string | null>(
    user.image,
  )
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  // Sinkronkan foto jika data user dari server diperbarui
  React.useEffect(() => {
    setSelectedImage(user.image)
  }, [user.image])

  const form = useForm({
    defaultValues: {
      name: user.name,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      const trimmedName = value.name.trim()

      if (trimmedName.length < 2) {
        setSubmitError('Nama minimal 2 karakter')
        return
      }

      if (trimmedName.length > 50) {
        setSubmitError('Nama maksimal 50 karakter')
        return
      }

      try {
        setIsSubmitting(true)
        await updateMyProfile({
          data: {
            name: trimmedName,
            image: selectedImage ?? undefined,
          },
        })
        setIsEditing(false)
        onProfileUpdated?.()
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : 'Gagal memperbarui profil',
        )
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  const handleCancel = () => {
    setIsEditing(false)
    setSelectedImage(user.image)
    setSubmitError(null)
    form.reset()
  }

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U'
  const isModerator = user.role === 'moderator' || user.role === 'superadmin'

  return (
    <>
      <Card variant="canvas">
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6"
          >
            {/* Bagian Avatar (Tampilan atau Interaktif saat Mode Edit) */}
            <div className="relative shrink-0">
              {isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsAvatarPickerOpen(true)}
                  className="group relative cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label="Ubah foto avatar"
                  title="Klik untuk memilih avatar taktis"
                >
                  <Avatar size="2xl">
                    {selectedImage && (
                      <AvatarImage
                        src={selectedImage}
                        alt={user.name || 'Foto Profil'}
                      />
                    )}
                    <AvatarFallback>{userInitial}</AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <CameraIcon className="size-6 drop-shadow-sm" />
                  </div>
                  <div className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full bg-[var(--color-pine)] text-white shadow-xs ring-2 ring-card">
                    <CameraIcon className="size-3.5" />
                  </div>
                </button>
              ) : (
                <Avatar size="2xl">
                  {user.image && (
                    <AvatarImage
                      src={user.image}
                      alt={user.name || 'Foto Profil'}
                    />
                  )}
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
              )}
            </div>

            {/* Bagian Konten Identitas (Nama/Input, Email, Role & Waktu Gabung) */}
            <div className="min-w-0 flex-1 space-y-1">
              {isEditing ? (
                <div className="space-y-1">
                  <form.Field
                    name="name"
                    validators={{
                      onChange: ({ value }) => {
                        const trimmed = value.trim()
                        if (trimmed.length < 2) return 'Nama minimal 2 karakter'
                        if (trimmed.length > 50)
                          return 'Nama maksimal 50 karakter'
                        return undefined
                      },
                    }}
                  >
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        field.state.meta.errors.length > 0
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name} className="sr-only">
                            Nama Lengkap
                          </FieldLabel>
                          <InputGroup className="max-w-md">
                            <InputGroupAddon align="inline-start">
                              <UserIcon className="size-4" />
                            </InputGroupAddon>
                            <InputGroupInput
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              placeholder="Nama Lengkap Anda"
                              disabled={isSubmitting}
                              autoFocus
                            />
                          </InputGroup>
                          {isInvalid && (
                            <FieldError>
                              {field.state.meta.errors[0]}
                            </FieldError>
                          )}
                        </Field>
                      )
                    }}
                  </form.Field>

                  {submitError && (
                    <p className="text-xs font-medium text-destructive">
                      {submitError}
                    </p>
                  )}
                </div>
              ) : (
                <h2 className="truncate text-xl font-bold text-foreground sm:text-2xl">
                  {user.name}
                </h2>
              )}

              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge
                  variant={isModerator ? 'info' : 'secondary'}
                  size="default"
                >
                  {user.role === 'moderator' ? (
                    <>
                      <ShieldCheckIcon className="size-3" />
                      Petugas
                    </>
                  ) : user.role === 'superadmin' ? (
                    <>
                      <ShieldCheckIcon className="size-3" />
                      Superadmin
                    </>
                  ) : (
                    <>
                      <UserIcon className="size-3" />
                      Warga
                    </>
                  )}
                </Badge>

                <span className="text-xs text-muted-foreground">
                  Bergabung{' '}
                  {new Date(user.createdAtIso).toLocaleDateString('id-ID', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Bagian Tombol Aksi (Edit Profil vs Batal/Simpan) */}
            <div className="flex shrink-0 items-center gap-2 pt-2 sm:pt-0">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    <XIcon className="size-4" />
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="ember"
                    size="sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner className="size-3.5" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="size-3.5" />
                        Simpan
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="shrink-0"
                >
                  <PencilIcon className="size-3.5" />
                  Edit Profil
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modal Dialog (Desktop) / Drawer (Mobile) Pemilih Avatar Preset */}
      <AvatarPickerOverlay
        open={isAvatarPickerOpen}
        onOpenChange={setIsAvatarPickerOpen}
        currentAvatar={selectedImage}
        onSelect={(avatarPath) => {
          setSelectedImage(avatarPath)
        }}
      />
    </>
  )
}
