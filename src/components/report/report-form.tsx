import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { AlertCircleIcon, FlameIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import type { IncidentType } from '@/lib/schema'
import { cn } from '@/lib/utils'
import { submitCitizenReport } from '@/server/functions/reports'
import { DateTimePicker } from './date-time-picker'
import { MapPinPicker } from './map-pin-picker'
import { PhotoUploadZone } from './photo-upload-zone'
import type { UploadedPhotoData } from './photo-upload-zone'

interface ReportFormValues {
  photoData: UploadedPhotoData | null
  incidentType: IncidentType
  observedAt: Date
  description: string
  latitude: number
  longitude: number
  addressDisplay: string
  agreement: boolean
}

export function ReportForm() {
  const navigate = useNavigate()

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [locationError, setLocationError] = React.useState<string | null>(null)

  const initialValues: ReportFormValues = {
    photoData: null,
    incidentType: 'karhutla',
    observedAt: new Date(),
    description: '',
    latitude: -0.5021, // Default Riau
    longitude: 101.4478,
    addressDisplay: '',
    agreement: false,
  }

  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      if (!value.photoData?.r2ObjectKey) {
        setSubmitError(
          'Foto bukti kejadian wajib diunggah untuk menekan laporan palsu.',
        )
        return
      }

      if (value.description.trim().length < 15) {
        setSubmitError(
          'Deskripsi kejadian minimal 15 karakter agar petugas memperoleh konteks yang cukup.',
        )
        return
      }

      if (
        value.latitude < -11 ||
        value.latitude > 6 ||
        value.longitude < 95 ||
        value.longitude > 141
      ) {
        setSubmitError(
          'Koordinat kejadian berada di luar batas wilayah kedaulatan Indonesia.',
        )
        return
      }

      if (!value.agreement) {
        setSubmitError(
          'Anda wajib mencentang persetujuan kebenaran informasi sebelum mengirim laporan.',
        )
        return
      }

      try {
        setIsSubmitting(true)

        const payload = {
          incidentType: value.incidentType,
          description: value.description.trim(),
          observedAt: value.observedAt.toISOString(),
          latitude: value.latitude,
          longitude: value.longitude,
          addressDisplay: value.addressDisplay.trim() || undefined,
          r2ObjectKey: value.photoData.r2ObjectKey,
          fileHashSha256: value.photoData.fileHashSha256,
          exifCaptureTime: value.photoData.exifCaptureTime,
          isAnonymous: false,
        }

        const result = await submitCitizenReport({ data: payload })

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
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="flex flex-col gap-6"
    >
      {/* Alert Error Kirim */}
      {submitError && (
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertTitle>Gagal Mengirimkan Laporan</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* CARD 1: FOTO BUKTI KEJADIAN */}
      <Card>
        <CardHeader>
          <CardTitle>1. Bukti Foto Kejadian</CardTitle>
          <CardDescription>
            Unggah minimal satu foto bukti kebakaran yang Anda amati langsung
            dari lokasi yang aman.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form.Field
            name="photoData"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? 'Foto bukti kejadian wajib diunggah untuk menekan laporan palsu.'
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <PhotoUploadZone
                  onPhotoUploaded={(data) => {
                    field.handleChange(data)
                  }}
                  onPhotoRemoved={() => {
                    field.handleChange(null)
                  }}
                  disabled={isSubmitting}
                  error={field.state.meta.errors[0]}
                />
              </div>
            )}
          </form.Field>
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
            <form.Field name="incidentType">
              {(field) => (
                <Field>
                  <FieldLabel>Kategori Kebakaran</FieldLabel>
                  <RadioGroup
                    value={field.state.value}
                    onValueChange={(val) =>
                      field.handleChange(val as IncidentType)
                    }
                    className="mt-1.5 grid-cols-1 sm:grid-cols-2"
                  >
                    {/* Opsi Karhutla */}
                    <label
                      htmlFor="incident-karhutla"
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all',
                        field.state.value === 'karhutla'
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
                        field.state.value === 'permukiman'
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
                          Rumah tinggal, toko, ruko, atau pemukiman padat
                          penduduk
                        </span>
                      </div>
                    </label>

                    {/* Opsi Industri */}
                    <label
                      htmlFor="incident-industri"
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all',
                        field.state.value === 'industri'
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
                        field.state.value === 'lainnya'
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
              )}
            </form.Field>

            {/* Waktu Teramati dengan DateTimePicker berbasis Calendar */}
            <form.Field name="observedAt">
              {(field) => (
                <Field>
                  <FieldLabel>Waktu Kejadian Teramati</FieldLabel>
                  <DateTimePicker
                    value={field.state.value}
                    onChange={(date) => field.handleChange(date)}
                    disabled={isSubmitting}
                  />
                  <FieldDescription>
                    Waktu perkiraan saat Anda pertama kali melihat titik api
                    atau asap.
                  </FieldDescription>
                </Field>
              )}
            </form.Field>

            {/* Deskripsi Situasi */}
            <form.Field
              name="description"
              validators={{
                onChange: ({ value }) =>
                  value.trim().length < 15
                    ? 'Deskripsi kejadian minimal 15 karakter agar petugas memperoleh konteks yang cukup.'
                    : undefined,
              }}
            >
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="report-description">
                      Deskripsi Situasi Kejadian
                    </FieldLabel>
                    <span className="text-[11px] text-muted-foreground">
                      {field.state.value.length} / 1000 karakter
                    </span>
                  </div>
                  <Textarea
                    id="report-description"
                    placeholder="Contoh: Titik api membesar di pinggir jalan perkebunan sawit, asap pekat mengarah ke arah timur, mobil pemadam belum terlihat di lokasi..."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    rows={4}
                    maxLength={1000}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>{field.state.meta.errors[0]}</FieldError>
                  )}
                  <FieldDescription>
                    Jelaskan kondisi api, arah angin, asap tebal, akses jalan
                    untuk armada pemadam, atau potensi bahaya sekitar.
                  </FieldDescription>
                </Field>
              )}
            </form.Field>
          </div>
        </CardContent>
      </Card>

      {/* CARD 3: TITIK LOKASI & KOORDINAT */}
      <Card>
        <CardHeader>
          <CardTitle>3. Titik Koordinat & Lokasi</CardTitle>
          <CardDescription>
            Peta interaktif di bawah menampilkan titik kebakaran. Geser pin,
            klik pada peta, atau tekan tombol GPS di pojok kanan atas peta untuk
            mendeteksi lokasi secara otomatis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Peta Interaktif Langsung (Inline Map) */}
            <form.Subscribe
              selector={(state) => [
                state.values.latitude,
                state.values.longitude,
              ]}
            >
              {([lat, lon]) => (
                <MapPinPicker
                  latitude={lat}
                  longitude={lon}
                  initialLat={initialValues.latitude}
                  initialLon={initialValues.longitude}
                  onChangeLocation={(newLat, newLon) => {
                    // Validasi batas wilayah Indonesia (Rule 5)
                    if (
                      newLat < -11 ||
                      newLat > 6 ||
                      newLon < 95 ||
                      newLon > 141
                    ) {
                      setLocationError(
                        'Koordinat kejadian berada di luar batas wilayah kedaulatan Indonesia.',
                      )
                    } else {
                      setLocationError(null)
                    }
                    form.setFieldValue('latitude', newLat)
                    form.setFieldValue('longitude', newLon)
                  }}
                  disabled={isSubmitting}
                />
              )}
            </form.Subscribe>

            {locationError && (
              <p className="text-xs font-medium text-destructive">
                {locationError}
              </p>
            )}

            {/* Input Alamat / Patokan Jalan */}
            <form.Field name="addressDisplay">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="address-display">
                    Patokan Alamat / Keterangan Jalan (Opsional)
                  </FieldLabel>
                  <Input
                    id="address-display"
                    placeholder="Contoh: Jl. Lintas Sumatra KM 42, dekat gerbang desa"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldDescription>
                    Tuliskan nama jalan, gedung penting, atau nomor tiang
                    listrik terdekat untuk mempermudah navigasi petugas.
                  </FieldDescription>
                </Field>
              )}
            </form.Field>
          </div>
        </CardContent>
      </Card>

      {/* CARD 4: PERNYATAAN & PERSETUJUAN */}
      <Card>
        <CardHeader>
          <CardTitle>4. Pernyataan & Persetujuan Pelaporan</CardTitle>
          <CardDescription>
            Pernyataan komitmen pelapor untuk menjamin pertanggungjawaban
            kebenaran informasi kedaruratan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form.Field
            name="agreement"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? 'Anda wajib menyetujui pernyataan kebenaran informasi sebelum mengirim laporan.'
                  : undefined,
            }}
          >
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0}>
                <label
                  htmlFor="report-agreement"
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all',
                    field.state.value
                      ? 'border-[var(--color-ember)] bg-[var(--color-ember)]/5 shadow-xs'
                      : 'border-border bg-card hover:bg-muted/30',
                  )}
                >
                  <input
                    type="checkbox"
                    id="report-agreement"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    disabled={isSubmitting}
                    className="mt-0.5 size-4 cursor-pointer rounded border-input text-[var(--color-ember)] focus:ring-[var(--color-ember)]"
                  />
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold text-foreground">
                      Saya menyatakan informasi dan bukti foto yang dilaporkan
                      adalah benar
                    </span>
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      Laporan dibuat berdasarkan pengamatan langsung di lokasi
                      kejadian untuk kepentingan keselamatan warga dan
                      penanganan darurat kebakaran, bukan laporan palsu atau
                      rekayasa.
                    </span>
                  </div>
                </label>
                {field.state.meta.errors.length > 0 && (
                  <FieldError>{field.state.meta.errors[0]}</FieldError>
                )}
              </Field>
            )}
          </form.Field>
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
              Mengirim Laporan...
            </>
          ) : (
            <>
              <FlameIcon className="size-5" />
              Kirim Laporan
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Dengan mengirimkan laporan, Anda menyatakan bahwa informasi dan bukti
          foto yang disampaikan adalah benar adanya untuk kepentingan
          penyelamatan dan penanganan kedaruratan publik.
        </p>
      </div>
    </form>
  )
}
