import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  FlameIcon,
  LocateFixedIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useSession } from '@/lib/auth-client'
import type { IncidentType } from '@/lib/schema'
import { cn } from '@/lib/utils'
import { submitCitizenReport } from '@/server/functions/reports'
import { MapPinPicker } from './map-pin-picker'
import { PhotoUploadZone } from './photo-upload-zone'
import type { UploadedPhotoData } from './photo-upload-zone'

export function ReportForm() {
  const navigate = useNavigate()
  const { data: session } = useSession()

  // Form States
  const [incidentType, setIncidentType] =
    React.useState<IncidentType>('karhutla')
  const [description, setDescription] = React.useState('')
  const [observedAt, setObservedAt] = React.useState<string>(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  })

  // Lokasi States
  const [latitude, setLatitude] = React.useState<number>(-0.5021) // Default Riau
  const [longitude, setLongitude] = React.useState<number>(101.4478)
  const [addressDisplay, setAddressDisplay] = React.useState('')
  const [gpsLocked, setGpsLocked] = React.useState(false)
  const [gpsLoading, setGpsLoading] = React.useState(false)
  const [mapPickerOpen, setMapPickerOpen] = React.useState(false)

  // Bukti Media States
  const [photoData, setPhotoData] = React.useState<UploadedPhotoData | null>(
    null,
  )

  // Identitas Pelapor States
  const [reporterName, setReporterName] = React.useState('')
  const [reporterPhone, setReporterPhone] = React.useState('')
  const [isAnonymous, setIsAnonymous] = React.useState(false)

  // Submission States
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  // Sinkronisasi nama jika pengguna telah masuk dengan Google OAuth
  React.useEffect(() => {
    if (session?.user.name && !reporterName) {
      setReporterName(session.user.name)
    }
  }, [session, reporterName])

  // Deteksi Lokasi Browser (GPS)
  const handleDetectGps = () => {
    if (!('geolocation' in navigator)) {
      setErrors((prev) => ({
        ...prev,
        location:
          'Peramban Anda tidak mendukung deteksi lokasi GPS. Silakan tentukan lokasi lewat peta.',
      }))
      return
    }

    setGpsLoading(true)
    setErrors((prev) => {
      const next = { ...prev }
      delete next.location
      return next
    })

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6))
        const lon = Number(pos.coords.longitude.toFixed(6))

        // Validasi Bounding Box Indonesia
        if (lat < -11 || lat > 6 || lon < 95 || lon > 141) {
          setErrors((prev) => ({
            ...prev,
            location:
              'Lokasi GPS Anda terdeteksi di luar batas wilayah kedaulatan Indonesia.',
          }))
          setGpsLoading(false)
          return
        }

        setLatitude(lat)
        setLongitude(lon)
        setGpsLocked(true)
        setGpsLoading(false)
      },
      (err) => {
        console.warn('Gagal memperoleh GPS:', err.message)
        setErrors((prev) => ({
          ...prev,
          location:
            'Izin lokasi GPS peramban tidak diberikan atau sinyal lemah. Anda dapat memilih titik lokasi langsung dari peta.',
        }))
        setGpsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  // Validasi Form sebelum kirim
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!photoData?.r2ObjectKey) {
      newErrors.photo =
        'Foto bukti kejadian wajib diunggah untuk menekan laporan palsu.'
    }

    if (description.trim().length < 15) {
      newErrors.description =
        'Deskripsi kejadian minimal 15 karakter agar petugas memperoleh konteks yang cukup.'
    }

    if (latitude < -11 || latitude > 6 || longitude < 95 || longitude > 141) {
      newErrors.location =
        'Koordinat kejadian berada di luar batas wilayah Indonesia (-11 s/d 6 Lintang, 95 s/d 141 Bujur).'
    }

    if (
      reporterPhone &&
      !/^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(reporterPhone)
    ) {
      newErrors.phone =
        'Nomor telepon tidak valid. Gunakan format Indonesia yang benar (contoh: 081234567890).'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Eksekusi Pengiriman Laporan
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validateForm()) return
    if (!photoData) return

    try {
      setIsSubmitting(true)

      const payload = {
        incidentType,
        description: description.trim(),
        observedAt: new Date(observedAt).toISOString(),
        latitude,
        longitude,
        addressDisplay: addressDisplay.trim() || undefined,
        r2ObjectKey: photoData.r2ObjectKey,
        fileHashSha256: photoData.fileHashSha256,
        exifCaptureTime: photoData.exifCaptureTime,
        reporterName: isAnonymous
          ? undefined
          : reporterName.trim() || undefined,
        reporterPhone: isAnonymous
          ? undefined
          : reporterPhone.trim() || undefined,
        isAnonymous,
      }

      const result = await submitCitizenReport({ data: payload })

      // Alihkan ke halaman pelacakan detail
      navigate({
        to: '/lacak/$code',
        params: { code: result.trackingCode },
      })
    } catch (err) {
      console.error('Galat pengiriman laporan:', err)
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Terjadi kendala saat mendaftarkan laporan. Periksa jaringan Anda dan coba lagi.',
      )
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Alert Error Kirim */}
      {submitError && (
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertTitle>Gagal Mengirimkan Laporan</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* CARD 1: FOTO BUKTI KEJADIAN (WAJIB) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>1. Bukti Foto Kejadian</CardTitle>
            <Badge variant="default" size="xs">
              Wajib (Rule 4)
            </Badge>
          </div>
          <CardDescription>
            Unggah minimal satu foto bukti kebakaran yang Anda amati langsung
            dari lokasi yang aman.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PhotoUploadZone
            onPhotoUploaded={(data) => {
              setPhotoData(data)
              setErrors((prev) => {
                const next = { ...prev }
                delete next.photo
                return next
              })
            }}
            onPhotoRemoved={() => setPhotoData(null)}
            disabled={isSubmitting}
            error={errors.photo}
          />
        </CardContent>
      </Card>

      {/* CARD 2: RINCIAN KEJADIAN */}
      <Card>
        <CardHeader>
          <CardTitle>2. Rincian & Karakteristik Insiden</CardTitle>
          <CardDescription>
            Tentukan kategori kebakaran dan waktu kejadian teramati untuk
            menentukan prioritas triase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-5">
            {/* Radio Group Kategori Insiden */}
            <Field>
              <FieldLabel>Kategori Kebakaran</FieldLabel>
              <RadioGroup
                value={incidentType}
                onValueChange={(val) =>
                  setIncidentType(val as IncidentType)
                }
                className="mt-1.5 grid-cols-1 sm:grid-cols-2"
              >
                {/* Opsi Karhutla */}
                <label
                  htmlFor="incident-karhutla"
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all',
                    incidentType === 'karhutla'
                      ? 'border-[var(--color-ember)] bg-[var(--color-ember)]/5 shadow-xs'
                      : 'border-border bg-card hover:bg-muted/30',
                  )}
                >
                  <RadioGroupItem
                    value="karhutla"
                    id="incident-karhutla"
                    className="mt-0.5"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">
                      Karhutla (Hutan & Lahan)
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Kebakaran lahan gambut, semak belukar, atau area
                      perkebunan
                    </span>
                  </div>
                </label>

                {/* Opsi Permukiman */}
                <label
                  htmlFor="incident-permukiman"
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all',
                    incidentType === 'permukiman'
                      ? 'border-[var(--color-ember)] bg-[var(--color-ember)]/5 shadow-xs'
                      : 'border-border bg-card hover:bg-muted/30',
                  )}
                >
                  <RadioGroupItem
                    value="permukiman"
                    id="incident-permukiman"
                    className="mt-0.5"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">
                      Permukiman Warga
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Rumah tinggal, toko, ruko, atau pemukiman padat penduduk
                    </span>
                  </div>
                </label>

                {/* Opsi Industri */}
                <label
                  htmlFor="incident-industri"
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all',
                    incidentType === 'industri'
                      ? 'border-[var(--color-ember)] bg-[var(--color-ember)]/5 shadow-xs'
                      : 'border-border bg-card hover:bg-muted/30',
                  )}
                >
                  <RadioGroupItem
                    value="industri"
                    id="incident-industri"
                    className="mt-0.5"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">
                      Industri & Pergudangan
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Kawasan pabrik, gudang logistik, atau instalasi
                      migas/kimia
                    </span>
                  </div>
                </label>

                {/* Opsi Lainnya */}
                <label
                  htmlFor="incident-lainnya"
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all',
                    incidentType === 'lainnya'
                      ? 'border-[var(--color-ember)] bg-[var(--color-ember)]/5 shadow-xs'
                      : 'border-border bg-card hover:bg-muted/30',
                  )}
                >
                  <RadioGroupItem
                    value="lainnya"
                    id="incident-lainnya"
                    className="mt-0.5"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">
                      Lainnya
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Tempat pembuangan sampah liar atau tumpukan material
                      terbuka
                    </span>
                  </div>
                </label>
              </RadioGroup>
            </Field>

            {/* Waktu Teramati */}
            <Field>
              <FieldLabel htmlFor="observed-at">
                Waktu Kejadian Teramati
              </FieldLabel>
              <Input
                id="observed-at"
                type="datetime-local"
                value={observedAt}
                onChange={(e) => setObservedAt(e.target.value)}
                className="max-w-xs"
                required
              />
              <FieldDescription>
                Waktu perkiraan saat Anda pertama kali melihat titik api atau
                asap.
              </FieldDescription>
            </Field>

            {/* Deskripsi Situasi */}
            <Field data-invalid={!!errors.description}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="report-description">
                  Deskripsi Situasi Kejadian
                </FieldLabel>
                <span className="text-[11px] text-muted-foreground">
                  {description.length} / 1000 karakter
                </span>
              </div>
              <Textarea
                id="report-description"
                placeholder="Contoh: Titik api membesar di pinggir jalan perkebunan sawit, asap pekat mengarah ke arah timur, mobil pemadam belum terlihat di lokasi..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  if (e.target.value.trim().length >= 15) {
                    setErrors((prev) => {
                      const next = { ...prev }
                      delete next.description
                      return next
                    })
                  }
                }}
                rows={4}
                maxLength={1000}
              />
              {errors.description && (
                <FieldError>{errors.description}</FieldError>
              )}
              <FieldDescription>
                Jelaskan kondisi api, arah angin, asap tebal, akses jalan untuk
                armada pemadam, atau potensi bahaya sekitar.
              </FieldDescription>
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* CARD 3: TITIK LOKASI & KOORDINAT */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>3. Titik Koordinat & Lokasi</CardTitle>
            {gpsLocked && (
              <Badge variant="success">
                <CheckCircle2Icon className="size-3" /> GPS Terkunci
              </Badge>
            )}
          </div>
          <CardDescription>
            Akurasi lokasi sangat penting agar armada penanggulangan dapat
            menavigasi rute terdekat menuju titik api.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Tombol GPS dan Peta */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDetectGps}
                disabled={gpsLoading || isSubmitting}
              >
                {gpsLoading ? (
                  <Spinner className="size-4" />
                ) : (
                  <LocateFixedIcon className="size-4 text-[var(--color-ember)]" />
                )}
                Gunakan Lokasi Saya (GPS)
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMapPickerOpen(true)}
                disabled={isSubmitting}
              >
                <MapPinIcon className="size-4" />
                Tandai Titik di Peta
              </Button>
            </div>

            {/* Tampilan Koordinat Terpilih */}
            <div className="flex flex-col gap-1 rounded-md border border-border bg-muted/30 p-3">
              <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Koordinat WGS84 Terpilih (PostGIS)
              </span>
              <div className="flex items-center gap-3 font-mono text-xs text-foreground">
                <span>
                  Lat: <strong className="text-foreground">{latitude}</strong>
                </span>
                <Separator orientation="vertical" className="h-3" />
                <span>
                  Lon: <strong className="text-foreground">{longitude}</strong>
                </span>
              </div>
            </div>

            {/* Input Alamat / Patokan Jalan */}
            <Field>
              <FieldLabel htmlFor="address-display">
                Patokan Alamat / Keterangan Jalan (Opsional)
              </FieldLabel>
              <Input
                id="address-display"
                placeholder="Contoh: Jl. Lintas Sumatra KM 42, dekat gerbang desa"
                value={addressDisplay}
                onChange={(e) => setAddressDisplay(e.target.value)}
              />
              <FieldDescription>
                Tuliskan nama jalan, gedung penting, atau nomor tiang listrik
                terdekat untuk mempermudah navigasi petugas.
              </FieldDescription>
            </Field>

            {errors.location && (
              <p className="text-xs font-medium text-destructive">
                {errors.location}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CARD 4: DATA PELAPOR (OPSIONAL & PRIVASI) */}
      <Card>
        <CardHeader>
          <CardTitle>4. Identitas Pelapor & Jaminan Privasi</CardTitle>
          <CardDescription>
            Data pribadi Anda dilindungi secara ketat dan tidak pernah
            dipublikasikan ke umum (Rule 7).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {session?.user ? (
              <div className="flex items-center gap-3 rounded-lg border border-[var(--color-pine)]/20 bg-[var(--color-pine)]/5 p-3">
                <ShieldCheckIcon className="size-5 shrink-0 text-[var(--color-pine)]" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">
                    Masuk sebagai {session.user.name} ({session.user.email})
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Laporan akan otomatis tersambung ke dasbor "Laporan Saya"
                    untuk pelacakan riwayat pribadi.
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="reporter-name">
                    Nama Anda (Opsional)
                  </FieldLabel>
                  <Input
                    id="reporter-name"
                    placeholder="Nama panggilan Anda"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    disabled={isAnonymous}
                  />
                </Field>

                <Field data-invalid={!!errors.phone}>
                  <FieldLabel htmlFor="reporter-phone">
                    Nomor Telepon / WhatsApp (Opsional)
                  </FieldLabel>
                  <Input
                    id="reporter-phone"
                    placeholder="08xxxxxxxxxx"
                    value={reporterPhone}
                    onChange={(e) => {
                      setReporterPhone(e.target.value)
                      setErrors((prev) => {
                        const next = { ...prev }
                        delete next.phone
                        return next
                      })
                    }}
                    disabled={isAnonymous}
                  />
                  {errors.phone && <FieldError>{errors.phone}</FieldError>}
                </Field>
              </div>
            )}

            {/* Opsi Kirim Sebagai Anonim */}
            <label className="flex cursor-pointer items-center gap-2.5 pt-1 text-xs text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="size-4 rounded border-input text-[var(--color-ember)] focus:ring-[var(--color-ember)]"
              />
              <span>
                Kirim laporan ini sebagai <strong>Anonim</strong> (tidak
                menautkan nama atau profil akun Anda ke laporan publik).
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* TOMBOL AKSI UTAMA */}
      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          variant="ember"
          size="lg"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Spinner className="size-5" />
              Mendaftarkan Laporan ke Triase...
            </>
          ) : (
            <>
              <FlameIcon className="size-5" />
              Kirim Laporan Terverifikasi
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Dengan mengirimkan laporan, Anda menyatakan bahwa informasi dan bukti
          foto yang disampaikan adalah benar adanya untuk kepentingan
          penyelamatan dan penanganan kedaruratan publik.
        </p>
      </div>

      {/* Modal Map Pin Picker */}
      <MapPinPicker
        open={mapPickerOpen}
        onOpenChange={setMapPickerOpen}
        initialLat={latitude}
        initialLon={longitude}
        onConfirmLocation={(newLat, newLon, hint) => {
          setLatitude(newLat)
          setLongitude(newLon)
          setGpsLocked(true)
          if (hint && !addressDisplay) {
            setAddressDisplay(hint)
          }
          setErrors((prev) => {
            const next = { ...prev }
            delete next.location
            return next
          })
        }}
      />
    </form>
  )
}
