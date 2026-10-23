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
| **Target URL**    | _(Live deployment di Cloudflare Workers)_             |

---

## Tech Stack

Dibangun dengan arsitektur modern berbasis Edge Computing, _type-safety_ end-to-end, dan performa tinggi:

- **Runtime & Package Manager:** [Bun](https://bun.sh/) (Eksekusi script & package management ultra-cepat)
- **Frontend & Fullstack Framework:** [TanStack Start](https://tanstack.com/start) (React 19 / SSR / Streaming di Edge)
- **Routing & State Management:** [TanStack Router](https://tanstack.com/router) & [TanStack Query](https://tanstack.com/query)
- **Form Handling & Validasi Skema:** [TanStack Form](https://tanstack.com/form) + [Zod](https://zod.dev) (Isomorphic schema validation)
- **UI Components & Desain:** [shadcn/ui](https://ui.shadcn.com/) (Base UI primitives) + [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & Spatial Engine:** [Neon](https://neon.tech/) Serverless PostgreSQL dengan ekstensi [PostGIS](https://postgis.net/) (koneksi via `@neondatabase/serverless`)
- **ORM & Migrasi:** [Drizzle ORM](https://orm.drizzle.team/) + `drizzle-kit` (Type-safe schema & zero-overhead queries)
- **Object Storage (Bukti Laporan):** [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) (Zero Egress S3-compatible storage dengan direct upload via **Presigned/Signed URL**)
- **Deployment & Edge Runtime:** [Cloudflare Workers](https://workers.cloudflare.com/)
- **Visualisasi Peta & Spasial:** [MapLibre GL JS](https://maplibre.org/) + CARTO Positron Vector Tiles
- **Data Eksternal / Validasi Silang:** NASA FIRMS API (Active Fire Data / Satelit VIIRS & MODIS)
- **Linter & Formatter:** [ESLint](https://eslint.org/) (Strict TypeScript & React Rules)
- **Standar Bahasa UI:** `bahasa-skills` (`bahasa-inti` & `bahasa-website`) untuk UX writing bebas AI-slop

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
git clone https://github.com/muzaaqi/siaga-warga.git
cd siaga-warga
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

# Moderator Session Secret
ADMIN_PASSCODE="your-secure-admin-passcode"
SESSION_SECRET="super-secret-crypto-key-at-least-32-chars"
```

### 5. Setup Database & Migrasi

```bash
# Push skema langsung ke Neon DB (dev)
bun run db:push

# Atau jalankan migrasi resmi Drizzle
bun run db:migrate
```

### 6. Jalankan Development Server

```bash
bun run dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

### 7. Deployment & Scripts

#### Opsi A: Cloudflare Workers (Edge)

```bash
bun run build        # Build produksi untuk Cloudflare Workers
bun run deploy       # Deploy ke Cloudflare Workers via Wrangler
```

#### Opsi B: Docker Container (Runtime Bun)

SiagaWarga mendukung opsi deployment kontainer berbasis runtime **Bun** (`oven/bun:1-alpine`) dengan static asset preloading otomatis dan SSR handler:

```bash
# Build Docker image
docker build -t siagawarga .

# Jalankan kontainer
docker run -p 3000:3000 --env-file .env siagawarga

# Atau jalankan menggunakan Docker Compose
docker compose up -d --build
```

Untuk menjalankan server produksi Bun secara langsung di mesin lokal:

```bash
bun run build
bun run start
```

#### Scripts Lainnya

```bash
bun run lint         # Jalankan ESLint & @shadcn/lint
bun run typecheck    # Jalankan TypeScript strict check
bun test             # Jalankan Bun test runner
bun run format       # Format kode via Prettier & ESLint fix
```

---

## Progress Saat Ini (WIA 2026 Milestone)

| Komponen / Fitur                     | Status          | Catatan                                                                           |
| ------------------------------------ | --------------- | --------------------------------------------------------------------------------- |
| **Riset & Problem Framing**          | Selesai         | Analisis subtema _Public Service Tracking_ & studi kasus karhutla                 |
| **Dokumen Perancangan & PRD**        | Selesai         | PRD v1.0, arsitektur data multi-status, etika pelaporan warga                     |
| **Workflow & Operating Manual**      | Selesai         | AGENTS.md, DESIGN.md, & AI skills (`/write-plan`, `/audit-plan`, `/execute-plan`) |
| **Setup Project & Tooling**          | Selesai         | Inisialisasi TanStack Start, Tailwind v4, Neon Drizzle, Base UI, ESLint           |
| **Landing Page & Edukasi Warga**     | Siap Dikerjakan | Antarmuka responsif, panduan keselamatan darurat 112/113                          |
| **Formulir Pelaporan Spasial**       | Terjadwal       | TanStack Form + Zod + Geolocation Picker                                          |
| **Spatial Deduplication & PostGIS**  | Terjadwal       | Query pendeteksi laporan klaster & radius                                         |
| **Integrasi NASA FIRMS Hotspot**     | Terjadwal       | Ingestion API titik panas satelit real-time                                       |
| **Moderator Triage Dashboard**       | Terjadwal       | Antrean triase prioritas & panel peninjauan bukti                                 |
| **Public Tracking & Audit Timeline** | Terjadwal       | Peta insiden publik + transparansi status penanganan                              |

> Target **First Draft Submission (01 November 2026):** Landing page, alur dasar form pelaporan, dan dokumen PDF progress tim siap dikumpulkan.

---

## Struktur Direktori

```
ON-FIRE/
├── PRD.md                          # Product requirements (source of truth)
├── AGENTS.md                       # Technical operating manual & architecture rules
├── DESIGN.md                       # Visual design system & token definitions
├── src/
│   ├── routes/                     # File-based routing TanStack Router
│   │   ├── __root.tsx              # Root shell layout & providers
│   │   ├── index.tsx               # Landing page publik & edukasi
│   │   ├── lapor.tsx               # Form pelaporan warga
│   │   ├── pantau.tsx              # Peta publik tracking status laporan
│   │   ├── lacak.$code.tsx         # Detail tracking linimasa per laporan
│   │   └── admin/                  # Dashboard triase moderator
│   ├── components/                 # Komponen UI (shadcn/ui Base UI + custom)
│   │   ├── ui/                     # Primitives shadcn/ui
│   │   ├── shared/                 # Emergency banner, nav, theme toggle
│   │   └── map/                    # MapLibre visualizer & cluster layer
│   ├── server/                     # Server functions (`createServerFn`) & logic
│   │   ├── db/                     # Drizzle ORM client (Neon serverless) & schema
│   │   ├── functions/              # Endpoints: reports, evidence, hotspots, moderator
│   │   └── services/               # PostGIS spatial, R2 presigner, NASA FIRMS
│   ├── lib/                        # Zod schemas, exifr metadata, utils
│   └── styles.css                  # Tailwind CSS v4 styling & OKLCH tokens
├── drizzle/                        # Drizzle migrations generated via drizzle-kit
├── docs/                           # Dokumentasi & implementation plans
│   ├── guides/                     # Guidebook resmi lomba
│   └── plans/                      # Plan fitur terstruktur (NN-<feature>.md)
├── wrangler.jsonc                  # Konfigurasi deploy Cloudflare Workers
├── package.json
└── README.md
```

---

## Tim Pengembang

Disusun oleh Tim Peserta **Web In Action (WIA) — Multimedia In Action 2026**:

- **Ketua Tim / Fullstack Engineer:** Muzaaqi ([@muzaaqi](https://github.com/muzaaqi))
- **Pengembang / Frontend Engineer:** Hanif Musa Daut ([@Hanifmd45](https://github.com/Hanifmd45))
- **Pengembang / Data & Geospatial Engineer:** Wildan Akmal ([@Khairil-12](https://github.com/Khairil-12))

---

_Lisensi: Proyek ini dikembangkan secara orisinal untuk Multimedia In Action (MIA) 2026._
