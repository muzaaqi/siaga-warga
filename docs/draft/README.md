# SiagaWarga — Platform Public Service Tracking & Verifikasi Laporan Kebakaran Berbasis Partisipasi Publik

> **SiagaWarga** adalah platform pemantauan dan pelaporan kebakaran hutan, lahan (karhutla), serta permukiman secara transparan dengan sistem verifikasi berjenjang, deduplikasi spasial, dan validasi silang data satelit aktif (NASA FIRMS) untuk menjembatani komunikasi masyarakat dan instansi tanggap darurat di Indonesia.

---

## Ringkasan Proyek

| Informasi         | Keterangan                                            |
| ----------------- | ----------------------------------------------------- |
| **Kompetisi**     | Web In Action (WIA) — Multimedia In Action (MIA) 2026 |
| **Penyelenggara** | KSM Multimedia UPN Veteran Jakarta                    |
| **Tema Utama**    | _From Visionaries to Architects of Change_            |
| **Subtema**       | **Public Service Tracking**                           |
| **Target URL**    | _(Live staging deployment di Cloudflare Workers)_     |

---

## Tech Stack

Dibangun dengan arsitektur modern berbasis Edge Computing, _type-safety_ end-to-end, dan performa tinggi:

- **Runtime & Package Manager:** [Bun](https://bun.sh/) (Eksekusi script & package management ultra-cepat)
- **Frontend & Fullstack Framework:** [TanStack Start](https://tanstack.com/start) (React 19 / SSR / Streaming di Edge)
- **Routing & State Management:** [TanStack Router](https://tanstack.com/router) & [TanStack Query](https://tanstack.com/query)
- **Form Handling & Validasi Skema:** [TanStack Form](https://tanstack.com/form) + [Zod](https://zod.dev) (Isomorphic schema validation)
- **UI Components & Desain:** [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & Spatial Engine:** [Neon](https://neon.tech/) Serverless PostgreSQL dengan ekstensi [PostGIS](https://postgis.net/) (koneksi via `@neondatabase/serverless`)
- **ORM & Migrasi:** [Drizzle ORM](https://orm.drizzle.team/) + `drizzle-kit` (Type-safe schema & zero-overhead queries)
- **Object Storage (Bukti Laporan):** [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) (Zero Egress S3-compatible storage dengan direct upload via **Presigned/Signed URL**)
- **Deployment & Edge Runtime:** [Cloudflare Workers](https://workers.cloudflare.com/)
- **Visualisasi Peta & Spasial:** [MapLibre GL JS](https://maplibre.org/) + CARTO Positron Vector Tiles
- **Data Eksternal / Validasi Silang:** NASA FIRMS API (Active Fire Data / Satelit VIIRS & MODIS)

---

## Nilai Utama & Pendekatan Validasi (Validation Approach)

Berbeda dari aplikasi pelaporan konvensional yang mengklaim status sepihak, SiagaWarga menerapkan prinsip **kejujuran sistem (system honesty)** dan **validasi 3-lapisan**:

```
[ Warga Submit Laporan ]
        │
        ▼
1. Validasi Input & Bukti Media (Presigned Upload)
   ├── Permintaan Signed URL ke Server -> Upload langsung ke Cloudflare R2
   ├── Skema Zod ketat (koordinat batas RI, waktu pengamatan wajar)
   ├── Deteksi foto duplikat lintas akun (Crypto Hashing)
   └── Ekstraksi metadata waktu (exifr)
        │
        ▼
2. Triase Cerdas & Deduplikasi Spasial
   ├── PostGIS ST_DWithin: Deteksi laporan berdekatan (< 2 km & < 4 jam)
   ├── NASA FIRMS Check: Korelasi titik panas satelit terdekat
   └── Rule-based Urgensi: Prioritas tinggi jika dekat permukiman/fasilitas
        │
        ▼
3. Verifikasi Manusia (Human-in-the-Loop)
   ├── Moderator antrean triase memeriksa bukti dan korelasi data
   └── Multi-status transparan: verification_status, priority, handling_status
        │
        ▼
4. Transparansi Penanganan Publik & Jejak Audit
   ├── Linimasa publik terverifikasi tanpa kebocoran PII/privasi pelapor
   └── Log audit imutabel setiap transisi status
```

---

## Cara Menjalankan Project

Ikuti langkah-langkah berikut untuk menjalankan project di lingkungan lokal:

### 1. Prasyarat

Pastikan telah menginstal:

- [Bun](https://bun.sh/) (v1.1+ atau versi terbaru)
- Git CLI
- Akun Cloudflare (untuk Wrangler CLI)

### 2. Clone Repository

```bash
git clone https://github.com/muzaaqi/ON_FIRE.git
cd ON_FIRE
```

### 3. Install Dependensi

```bash
bun install
```

### 4. Konfigurasi Environment Variables

Salin file `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Isi variabel yang diperlukan:

```env
# Database Neon PostgreSQL dengan PostGIS
DATABASE_URL="postgresql://user:password@ep-xyz.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Cloudflare R2 Credentials (S3 API & Signed URL)
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_BUCKET_NAME="siagawarga-evidence"
R2_PUBLIC_URL="https://pub-xyz.r2.dev"

# NASA FIRMS API Key (Gratis di https://firms.modaps.eosdis.nasa.gov/api/map_key)
NASA_FIRMS_MAP_KEY="your-nasa-firms-map-key"
```

### 5. Jalankan Development Server

```bash
bun run dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

### 6. Build & Deploy ke Cloudflare Workers

```bash
bun run build
bunx wrangler deploy
```

---

## Progress Saat Ini (WIA 2026 Milestone)

| Komponen / Fitur                     | Status       | Catatan                                                           |
| ------------------------------------ | ------------ | ----------------------------------------------------------------- |
| **Riset & Problem Framing**          | Selesai      | Analisis subtema _Public Service Tracking_ & studi kasus karhutla |
| **Dokumen Perancangan & PRD**        | Selesai      | PRD, arsitektur data multi-status, etika pelaporan warga          |
| **Setup Project & Tooling**          | Dalam Proses | Inisialisasi TanStack Start, Tailwind v4, & konfigurasi Wrangler  |
| **Landing Page & Edukasi Warga**     | Dalam Proses | Antarmuka responsif, panduan keselamatan darurat                  |
| **Formulir Pelaporan Spasial**       | Terjadwal    | TanStack Form + Zod + Geolocation Picker                          |
| **Spatial Deduplication & PostGIS**  | Terjadwal    | Query pendeteksi laporan klaster & radius                         |
| **Integrasi NASA FIRMS Hotspot**     | Terjadwal    | Ingestion API titik panas satelit real-time                       |
| **Moderator Triage Dashboard**       | Terjadwal    | Antrean triase prioritas & panel peninjauan bukti                 |
| **Public Tracking & Audit Timeline** | Terjadwal    | Peta insiden publik + transparansi status penanganan              |

> Target **First Draft Submission (01 November 2026):** Landing page, alur dasar form pelaporan, dan dokumen PDF progress tim siap dikumpulkan.

---

## Struktur Direktori (Direncanakan)

```
ON-FIRE/
├── app/                        # TanStack Start source directory
│   ├── routes/                 # File-based routing TanStack Router
│   │   ├── __root.tsx          # Root layout & context provider
│   │   ├── index.tsx           # Landing page publik & edukasi
│   │   ├── lapor.tsx           # Form pelaporan warga
│   │   ├── pantau.tsx          # Peta publik tracking status laporan
│   │   ├── laporan.$id.tsx     # Detail tracking linimasa per laporan
│   │   └── admin/              # Dashboard triase moderator
│   ├── components/             # Komponen UI (shadcn/ui + custom)
│   │   ├── ui/                 # Primitives shadcn/ui
│   │   ├── forms/              # Form pelaporan & input komponen
│   │   └── map/                # MapLibre visualizer & cluster layer
│   ├── server/                 # Server functions (createServerFn) & logic
│   │   ├── db/                 # Drizzle ORM client (Neon serverless) & schema
│   │   │   ├── index.ts        # Database client instance
│   │   │   └── schema.ts       # Definisi tabel Drizzle & tipe PostGIS
│   │   ├── spatial.ts          # PostGIS ST_DWithin deduplication query
│   │   ├── nasa-firms.ts       # Service fetch titik panas satelit
│   │   └── storage.ts          # Cloudflare R2 S3 Presigned URL generator
│   └── styles/                 # Tailwind CSS styling
├── drizzle/                    # Drizzle migrations generated via drizzle-kit
├── drizzle.config.ts           # Konfigurasi Drizzle ORM
├── docs/                       # Dokumentasi resmi tim & panduan lomba
│   ├── draft/                  # Dokumen PRD, riset validasi, & panduan
│   └── guides/                 # Guidebook WIA MIA 2026 & Subtema
├── public/                     # Static assets & icons
├── wrangler.jsonc              # Konfigurasi deploy Cloudflare Workers
├── package.json
└── README.md
```

---

## Tim Pengembang

Disusun oleh Tim Peserta **Web In Action (WIA) — Multimedia In Action 2026**:

- **Ketua Tim / Fullstack Engineer:** Muzaaqi
- **Domain:** Public Service Tracking & Civic Accountability

---

_Lisensi: Proyek ini dikembangkan secara orisinal untuk Multimedia In Action (MIA) 2026._
