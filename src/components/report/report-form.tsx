import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  FlameIcon,
  LocateFixedIcon,
  MapPinIcon,
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
  reporterName: string
  reporterPhone: string
  isAnonymous: boolean
}

export function ReportForm() {
  const navigate = useNavigate()
  const { data: session } = useSession()

  const [gpsLocked, setGpsLocked] = React.useState(false)
  const [gpsLoading, setGpsLoading] = React.useState(false)
  const [mapPickerOpen, setMapPickerOpen] = React.useState(false)
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
    reporterName: '',
    reporterPhone: '',
    isAnonymous: false,
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

      if (
        value.reporterPhone &&
        !/^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(value.reporterPhone)
      ) {
        setSubmitError(
          'Nomor telepon tidak valid. Gunakan format Indonesia yang benar (contoh: 081234567890).',
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
          reporterName: value.isAnonymous
            ? undefined
            : value.reporterName.trim() || undefined,
          reporterPhone: value.isAnonymous
            ? undefined
            : value.reporterPhone.trim() || undefined,
          isAnonymous: value.isAnonymous,
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

  // Prefill nama pengguna bila login
  React.useEffect(() => {
    if (session?.user.name && !form.getFieldValue('reporterName')) {
      form.setFieldValue('reporterName', session.user.name)
    }
  }, [session, form])

  // Deteksi Lokasi Browser (GPS)
  const handleDetectGps = () => {
    if (!('geolocation' in navigator)) {
      setLocationError(
        'Peramban Anda tidak mendukung deteksi lokasi GPS. Silakan tentukan lokasi lewat peta.',
      )
      return
    }

    setGpsLoading(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6))
        const lon = Number(pos.coords.longitude.toFixed(6))

        // Validasi Bounding Box Indonesia
        if (lat < -11 || lat > 6 || lon < 95 || lon > 141) {
          setLocationError(
            'Lokasi GPS Anda terdeteksi di luar batas wilayah kedaulatan Indonesia.',
          )
          setGpsLoading(false)
          return
        }

        form.setFieldValue('latitude', lat)
        form.setFieldValue('longitude', lon)
        setGpsLocked(true)
        setGpsLoading(false)
      },
      (err) => {
        console.warn('Gagal memperoleh GPS:', err.message)
        setLocationError(
          'Izin lokasi GPS peramban tidak diberikan atau sinyal lemah. Anda dapat memilih titik lokasi langsung dari peta.',
        )
        setGpsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

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
            <form.Subscribe
              selector={(state) => [
                state.values.latitude,
                state.values.longitude,
              ]}
            >
              {([lat, lon]) => (
                <div className="flex flex-col gap-1 rounded-md border border-border bg-muted/30 p-3">
                  <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                    Koordinat WGS84 Terpilih (PostGIS)
                  </span>
                  <div className="flex items-center gap-3 font-mono text-xs text-foreground">
                    <span>
                      Lat: <strong className="text-foreground">{lat}</strong>
                    </span>
                    <Separator orientation="vertical" className="h-3" />
                    <span>
                      Lon: <strong className="text-foreground">{lon}</strong>
                    </span>
                  </div>
                </div>
              )}
            </form.Subscribe>

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

            {locationError && (
              <p className="text-xs font-medium text-destructive">
                {locationError}
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <form.Field name="reporterName">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="reporter-name">
                      Nama Anda (Opsional)
                    </FieldLabel>
                    <Input
                      id="reporter-name"
                      placeholder="Nama panggilan Anda"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={form.getFieldValue('isAnonymous')}
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field
                name="reporterPhone"
                validators={{
                  onChange: ({ value }) =>
                    value && !/^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(value)
                      ? 'Nomor telepon tidak valid. Gunakan format Indonesia yang benar (contoh: 081234567890).'
                      : undefined,
                }}
              >
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor="reporter-phone">
                      Nomor Telepon / WhatsApp (Opsional)
                    </FieldLabel>
                    <Input
                      id="reporter-phone"
                      placeholder="08xxxxxxxxxx"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={form.getFieldValue('isAnonymous')}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <FieldError>{field.state.meta.errors[0]}</FieldError>
                    )}
                  </Field>
                )}
              </form.Field>
            </div>

            {/* Opsi Kirim Sebagai Anonim */}
            <form.Field name="isAnonymous">
              {(field) => (
                <label className="flex cursor-pointer items-center gap-2.5 pt-1 text-xs text-muted-foreground hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className="size-4 rounded border-input text-[var(--color-ember)] focus:ring-[var(--color-ember)]"
                  />
                  <span>
                    Kirim laporan ini sebagai <strong>Anonim</strong> (tidak
                    menautkan nama atau profil akun Anda ke laporan publik).
                  </span>
                </label>
              )}
            </form.Field>
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

      {/* Modal Map Pin Picker */}
      <form.Subscribe
        selector={(state) => [state.values.latitude, state.values.longitude]}
      >
        {([lat, lon]) => (
          <MapPinPicker
            open={mapPickerOpen}
            onOpenChange={setMapPickerOpen}
            initialLat={lat}
            initialLon={lon}
            onConfirmLocation={(newLat, newLon, hint) => {
              form.setFieldValue('latitude', newLat)
              form.setFieldValue('longitude', newLon)
              setGpsLocked(true)
              if (hint && !form.getFieldValue('addressDisplay')) {
                form.setFieldValue('addressDisplay', hint)
              }
              setLocationError(null)
            }}
          />
        )}
      </form.Subscribe>
    </form>
  )
}
