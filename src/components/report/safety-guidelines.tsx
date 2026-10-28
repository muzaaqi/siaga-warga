import { BanIcon, WindIcon, EyeIcon, QuoteIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function SafetyGuidelines() {
  return (
    <section
      id="panduan-keselamatan"
      aria-labelledby="safety-heading"
      className="rounded-3xl border border-orange-100 bg-[#FFF8F5] p-6 sm:p-10 md:p-12 dark:border-amber-900/30 dark:bg-[#1A1715]"
    >
      {/* Top Split: Heading on Left & Fire Photo with Quote Callout on Right */}
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-6">
          <h2
            id="safety-heading"
            className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-4xl"
          >
            Panduan Keselamatan Warga di Lokasi Kebakaran
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Keselamatan jiwa adalah prioritas utama. Patuhi pedoman berikut saat
            berada di sekitar wilayah kebakaran demi melindungi diri dan orang
            di sekitar Anda.
          </p>
        </div>

        <div className="relative lg:col-span-6">
          <div className="relative overflow-hidden rounded-2xl shadow-md">
            <img
              src="/images/safety-fire.webp"
              alt="Petugas dan api kebakaran hutan"
              className="h-48 w-full object-cover sm:h-56 md:h-64"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Quote Callout Card */}
          <div className="relative -mt-8 ml-auto max-w-sm rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur-xs sm:-mt-12 sm:mr-4">
            <div className="flex items-start gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <QuoteIcon className="size-3.5" aria-hidden="true" />
              </span>
              <p className="text-xs leading-relaxed font-medium text-foreground">
                Jangan mendekati titik api. Keselamatan Anda lebih penting
                daripada dokumentasi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: 3 Tactical Pillar Cards */}
      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Card 1: Jarak Aman */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                <BanIcon className="size-5" aria-hidden="true" />
              </span>
              <CardTitle>Jaga Jarak Aman</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Jaga jarak minimal 100 meter dari pusat api atau tempat kebakaran.
              Hindari berada dalam zona yang rawan rambatan api atau mudah
              terbakar.
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Arah Angin */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400">
                <WindIcon className="size-5" aria-hidden="true" />
              </span>
              <CardTitle>Perhatikan Arah Angin</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Evakuasikan diri ke arah berlawanan atau menyilang dari hembusan
              asap pekat. Gunakan masker basah atau kain penutup hidung untuk
              mencegah inhalasi asap beracun.
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Dokumentasi Terlindung */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                <EyeIcon className="size-5" aria-hidden="true" />
              </span>
              <CardTitle>Dokumentasi Terlindung</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Ambil foto bukti hanya dari lokasi yang stabil, tidak terancam
              api, dan memiliki jalur evakuasi terbuka. Jangan membahayakan diri
              demi mengambil gambar.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
