# DESIGN.md — SiagaWarga Design System

> **This is the design system source of truth.**  
> Every UI component must strictly conform to the design tokens and craft standards defined here.  
> Never use hardcoded hex values, arbitrary font sizes, or inline styling overrides at component call sites.  
> All colors are defined in **OKLCH** and mapped to standard **shadcn theme CSS variables** via Tailwind CSS v4 `@theme inline`.  
> All Indonesian UI copy, button wording, alerts, and empty states must be drafted in compliance with `bahasa-skills` (`bahasa-inti` & `bahasa-website`).

---

## 1. Visual Philosophy: Tactical Mission Control

SiagaWarga adopts a **Tactical Mission Control** design language: a high-density, precise, and authoritative telemetry interface inspired by modern disaster response centers (such as NASA Disaster Watch, USGS Earthquake Hazards, and national civil defense consoles).

### Core Pillars

1. **Dual First-Class Lighting (System-Aware Default):**  
   The application defaults to the user's OS/device theme (`prefers-color-scheme`). Light Mode is meticulously optimized for citizens in the field under harsh sunlight, while Dark Mode is tuned for command center operators monitoring glowing map telemetry.
2. **Zero Gradients:**  
   No decorative AI gradients (no purple-to-cyan or orange-to-magenta fades). All surfaces, borders, and accents use solid, deliberate, flat colors.
3. **Zero Information Redundancy:**  
   Never repeat status labels or echo headers in subtitles. A status chip is not accompanied by a redundant text sentence repeating the same status.
4. **Universal Zero Emoji Policy & Strict Lucide Icons:**  
   Emojis are strictly forbidden across the entire project, including all documentation (`README.md`, `PRD.md`, `docs/**/*.md`), code comments, and web interfaces. In the UI, visual meaning is communicated strictly via official Lucide React icons (`*Icon`) and semantic color tokens.
5. **Tactical Precision Geometry:**  
   Corner radius scale is compact (`0.375rem` / 6px) to maximize screen estate for map layers, triage queues, and telemetry data tables.

---

## 2. Color Palette & shadcn Theme Mapping (OKLCH)

All colors are formulated in the **OKLCH** color space to guarantee mathematically uniform contrast and legibility across displays.

### 2.1 Canvas & Surface Tokens

| Token             | Light Mode (OKLCH)         | Dark Mode (OKLCH)       | shadcn Variable       | Usage                                    |
| ----------------- | -------------------------- | ----------------------- | --------------------- | ---------------------------------------- |
| `--background`    | `oklch(1.0 0 0)` (#ffffff) | `oklch(0.14 0.015 260)` | `--background`        | Pure white application canvas            |
| `--color-canvas`  | `oklch(0.98 0.005 100)`    | `oklch(0.18 0.02 260)`  | `--color-canvas`      | Warm tactile canvas & neutral containers |
| `--surface-card`  | `oklch(1.0 0 0)`           | `oklch(0.18 0.02 260)`  | `--card`              | Bento cards, telemetry cards, dialogs    |
| `--surface-muted` | `oklch(0.95 0.008 100)`    | `oklch(0.22 0.02 260)`  | `--muted`             | Input backgrounds, telemetry panel bars  |
| `--border`        | `oklch(0.91 0.005 100)`    | `oklch(0.28 0.025 260)` | `--border`, `--input` | 1px clean tactical element dividers      |
| `--popover`       | `oklch(1.0 0 0)`           | `oklch(0.20 0.02 260)`  | `--popover`           | Popover shells, select dropdowns         |

### 2.2 Semantic & Emergency Accent Tokens

| Token                      | OKLCH Value            | CSS Variable                      | Semantic Role                                                             |
| -------------------------- | ---------------------- | --------------------------------- | ------------------------------------------------------------------------- |
| **Forest Nightfall**       | `oklch(0.33 0.05 165)` | `--color-forest`, `--foreground`  | Authoritative brand green, deep headings, active tactical state text      |
| **Pine Needle**            | `oklch(0.44 0.07 165)` | `--color-pine`                    | Secondary forest tone, active card borders, telemetry sub-sections        |
| **Safety Ember**           | `oklch(0.55 0.19 45)`  | `--color-ember`, `--primary`      | Primary tactical CTA ("Laporkan Insiden", "Masuk"), active dock indicator |
| **Emergency Crimson**      | `oklch(0.51 0.20 28)`  | `--color-danger`, `--destructive` | High severity incidents, hot emergency alerts, destructive actions        |
| **Field Verified Emerald** | `oklch(0.72 0.17 150)` | `--success`                       | Confirmed incident by moderator, official extinguishing completion        |
| **Dispatch Sky**           | `oklch(0.68 0.16 230)` | `--info`                          | Agency forwarded notification ("Diteruskan ke Damkar"), en-route status   |
| **Caution Gold**           | `oklch(0.78 0.18 70)`  | `--warning`                       | NASA FIRMS satellite hotspots, unconfirmed alerts, pending validation     |

### 2.3 Typography & Text Roles

| Token                  | Light Mode (OKLCH)     | Dark Mode (OKLCH)       | shadcn Variable        | Usage                                             |
| ---------------------- | ---------------------- | ----------------------- | ---------------------- | ------------------------------------------------- |
| `--foreground`         | `oklch(0.18 0.02 260)` | `oklch(0.96 0.005 260)` | `--foreground`         | Headlines, primary text, high-contrast labels     |
| `--muted-foreground`   | `oklch(0.48 0.02 260)` | `oklch(0.68 0.015 260)` | `--muted-foreground`   | Timestamps, subtitles, secondary telemetry values |
| `--primary-foreground` | `oklch(0.98 0 0)`      | `oklch(0.98 0 0)`       | `--primary-foreground` | Text on Crimson CTA buttons                       |

---

## 3. Typography & Font Pairing

1. **Primary Sans-Serif:** **Plus Jakarta Sans** (`font-sans`)
   - Conveys a distinct, polished Indonesian civic-tech identity.
   - Clean, open counters, highly legible at small sizes (12px–14px) on mobile viewports.
2. **Monospace Telemetry:** **JetBrains Mono** (`font-mono`)
   - Strictly reserved for structured technical data:
     - Public Tracking Codes (e.g. `SW-2026-X89B`)
     - GPS Coordinates (e.g. `-6.2088, 106.8456`)
     - Timestamps and audit log IDs (e.g. `14:23:05 WIB`)
     - NASA FIRMS Sensor Identifiers (e.g. `VIIRS_SNPP_NRT`)

---

## 4. Component Standards & Geometry

### 4.1 Corner Radii

- Base Radius: `--radius: 0.375rem` (6px).
- All buttons, input fields, badges, cards, and modal sheets share this consistent 6px radius to preserve the compact tactical instrument feel.

### 4.2 Responsive Overlays (`src/components/ui/responsive-overlay.tsx`)

- Viewports `< 768px` (Mobile): Bottom Sheet / Drawer with draggable handle bar.
- Viewports `≥ 768px` (Desktop): Centered Dialog overlay.

### 4.3 Mandatory Photo Upload Zone

The file input component must integrate:

1. Prominent safety callout at the top:
   > **Perhatian Keselamatan:** Ambil foto dari jarak aman dan lokasi terlindung! Dilarang mendekati titik api aktif demi mengambil dokumentasi.
2. Client-side image compression progress bar.
3. Clean preview thumbnail with instant remove button.

### 4.4 Emergency Hotline Banner

Displayed prominently at the top of `/` and `/lapor`:

> **Darurat Segera?** Jika kebakaran mengancam keselamatan jiwa atau permukiman, segera hubungi **112** atau **113**. Layanan ini adalah instrumen pelacakan publik terverifikasi dan bukan pengganti kontak cepat tanggap darurat resmi.

### 4.5 Responsive Navigation Standard & MenuDock (`src/components/ui/menu-dock.tsx`)

Aplikasi mengadopsi pemisahan navigasi responsif adaptif antara tablet/desktop dan smartphone:

1. **Tablet & Desktop Navigation (≥ 768px / `md:flex`):**  
   Menggunakan navigasi atas klasik pada `HeaderNav` dengan tautan teks datar (_Beranda_, _Lapor Insiden_, _News_) dan garis indikator aktif tipis berwarna Forest Green (`#173b32` / `var(--color-forest)`).
2. **Mobile Smartphone Navigation (< 768px / `md:hidden`):**  
   Menggunakan komponen **`MenuDock`** taktis melayang di bagian bawah layar (`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden`) yang ramah jangkauan jempol (_thumb-zone accessibility_). Memiliki _sliding indicator_ dinamis Safety Ember (`var(--color-ember)`) dan efek _tactile hopping_ ikon (180 ms).
3. **Polymorphism via `render` Prop:**  
   Menghindari `asChild` Radix. Komponen `MenuDockItem` membungkus primitif `BaseButton` (`@base-ui/react`) dengan `render={<Link to="..." />}` untuk TanStack Router.
4. **Zero-Friction 1-Click "Masuk" Action:**  
   Navbar menghapus tombol "Sign In" dan menggantikan "Sign Up" dengan satu tombol aksi: **"Masuk"**. Mengklik "Masuk" langsung mengarahkan pengguna ke Google OAuth tanpa form atau modal perantara.
5. **Authenticated State Elevation:**  
   Setelah terotentikasi, tombol aksi di navbar beralih menjadi foto profil (`Avatar` Base UI). Mengklik foto membuka `DropdownMenu` taktis yang menyediakan opsi _"Laporan Saya"_, _"Dasbor Triase"_ (khusus moderator/superadmin), dan _"Keluar"_.

### 4.6 Standard Desktop Container Geometry (`max-w-4xl` for Operational Views)

Aplikasi menerapkan pemisahan kontainer desktop yang disengaja untuk menjaga ketertiban visual:

1. **Kanvas Bebas Halaman Utama (`/` — `max-w-7xl`):**  
   Halaman beranda mempertahankan lebar penuh (`max-w-7xl px-4 sm:px-6 lg:px-8`) untuk mengakomodasi hero banner, kartu pelacakan cepat, dan grid panduan keselamatan yang luas.
2. **Kontainer Terpadu Halaman Operasional & Konten (`max-w-4xl`):**  
   Seluruh halaman non-landing (`/news`, `/lapor`, `/profil`, `/pantau`, `/lacak/$code`, `/admin/triase`) wajib dibungkus dalam kontainer berukuran konsisten:
   ```tsx
   <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
   ```
   Seluruh elemen anak (bilah pencarian, formulir pelaporan, kartu berita Instagram, dan daftar riwayat) wajib mengisi lebar penuh (`w-full`). Dilarang menambahkan `max-w-` internal yang lebih sempit pada daftar kartu atau formulir karena menyebabkan margin kiri-kanan tidak sejajar dengan judul header.

---

## 5. Bahasa Indonesia Quality Standards (`bahasa-skills`)

All UI copy must adhere strictly to the rules of `bahasa-inti` and `bahasa-website`:

- **Zero AI-Slop Buzzwords:** Banned words include _hiruk pikuk_, _lanskap_, _menyelami_, _krusial_, _mulus_, _tangguh_, _garda terdepan_, _permadani_, _di era digital_.
- **Direct & Action-Oriented Microcopy:** Use standard Indonesian verb imperatives on buttons: _"Kirim Laporan"_, _"Lacak Status"_, _"Buka Peta"_, _"Verifikasi Bukti"_.
- **No Em-Dash Styling:** Never use em dashes (`—`) as decorative punctuation in UI labels or alert descriptions.
- **Proper Sentence Case:** Headings use standard Indonesian capitalization (capitalize first word and proper nouns only), never Title Case on every word.
