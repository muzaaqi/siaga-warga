import { BanIcon, WindIcon, EyeIcon } from 'lucide-react'
import { SafetyGuideCard } from './safety-guide-card'

export function SafetyGuideSection() {
  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Outer Container Card */}
        <div className="rounded-3xl border border-[#ebe8e2] bg-[#f9f0eb] p-6 transition-colors sm:p-10 lg:p-12 dark:border-border dark:bg-card/40">
          {/* Top Banner (Header & Photography Banner dengan Floating Quote) */}
          <div className="mb-8 grid grid-cols-1 items-center gap-8 lg:mb-12 lg:grid-cols-12">
            {/* Teks Judul Kiri */}
            <div className="space-y-3 lg:col-span-6">
              <h2 className="text-2xl font-bold tracking-tight text-[#173b32] sm:text-3xl lg:text-4xl dark:text-foreground">
                Panduan Keselamatan Warga di Lokasi Kebakaran
              </h2>
              <p className="text-sm leading-relaxed text-[#475467] sm:text-base dark:text-muted-foreground">
                Keselamatan jiwa adalah prioritas utama. Patuhi pedoman berikut
                saat berada di sekitar wilayah kebakaran.
              </p>
            </div>

            {/* Banner Foto Api Kanan dengan Kartu Kutipan Mengambang */}
            <div className="relative overflow-hidden rounded-2xl lg:col-span-6">
              <div className="relative aspect-16/9 w-full overflow-hidden rounded-2xl sm:aspect-21/9 lg:aspect-16/9">
                <img
                  src="/background.jpg"
                  alt="Dokumentasi penanganan kebakaran"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
              </div>

              {/* Floating Quote Card */}
              <div className="absolute top-1/2 right-4 max-w-xs -translate-y-1/2 rounded-xl border border-white/40 bg-white/95 p-3.5 shadow-lg backdrop-blur-md sm:right-6 sm:p-4 dark:border-border dark:bg-card/90">
                <div className="flex items-start gap-2.5">
                  <span className="text-xl leading-none font-bold text-[var(--color-ember)]">
                    “
                  </span>
                  <p className="text-xs leading-relaxed font-medium text-[#344054] sm:text-sm dark:text-foreground">
                    Jangan mendekati titik api. Keselamatan anda lebih penting
                    dari pada dokumentasi.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid 3 Kartu Pedoman Keselamatan (1:1 teks dengan landing.jpg) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            <SafetyGuideCard
              icon={BanIcon}
              iconColorVariant="danger"
              title="Jaga Jarak Aman"
              description="Jaga jarak minimal 100 meter dari pusat api atau tempat kebakaran. Hindari berada dalam zona yang rawan atau mudah terbakar."
            />

            <SafetyGuideCard
              icon={WindIcon}
              iconColorVariant="ember"
              title="Perhatikan Arah Angin"
              description="evakuasi diri ke arah berlawanan atau menyilang dari hembusan asap pekat. Gunakan masker basah atau kain penutup hidung untuk mencegah inhalasi asap beracun."
            />

            <SafetyGuideCard
              icon={EyeIcon}
              iconColorVariant="danger"
              title="Dokumentasi Terlindungi"
              description="Ambil foto bukti hanya dari lokasi yang stabil, tidak terancam api, dan memiliki jalur evakuasiterbuka. Jangan membahayakan diri demi mengambil gambar."
            />
          </div>
        </div>
      </div>
    </section>
  )
}
