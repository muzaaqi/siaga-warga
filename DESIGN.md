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
4. **Zero Emojis in System UI:**  
   No emojis used as icons, bullet points, or badges in the interface. Visual meaning is communicated strictly via official Lucide React icons (`*Icon`) and semantic color tokens.
5. **Tactical Precision Geometry:**  
   Corner radius scale is compact (`0.375rem` / 6px) to maximize screen estate for map layers, triage queues, and telemetry data tables.

---

## 2. Color Palette & shadcn Theme Mapping (OKLCH)

All colors are formulated in the **OKLCH** color space to guarantee mathematically uniform contrast and legibility across displays.

### 2.1 Canvas & Surface Tokens

| Token             | Light Mode (OKLCH)       | Dark Mode (OKLCH)       | shadcn Variable       | Usage                                   |
| ----------------- | ------------------------ | ----------------------- | --------------------- | --------------------------------------- |
| `--background`    | `oklch(0.985 0.005 260)` | `oklch(0.14 0.015 260)` | `--background`        | Default application canvas              |
| `--surface-card`  | `oklch(1.0 0 0)`         | `oklch(0.18 0.02 260)`  | `--card`              | Bento cards, report list rows, dialogs  |
| `--surface-muted` | `oklch(0.95 0.008 260)`  | `oklch(0.22 0.02 260)`  | `--muted`             | Input backgrounds, telemetry panel bars |
| `--border`        | `oklch(0.88 0.01 260)`   | `oklch(0.28 0.025 260)` | `--border`, `--input` | 1px clean tactical element dividers     |
| `--popover`       | `oklch(1.0 0 0)`         | `oklch(0.20 0.02 260)`  | `--popover`           | Popover shells, select dropdowns        |

### 2.2 Semantic & Emergency Accent Tokens

| Token                      | OKLCH Value            | shadcn Variable              | Semantic Role                                                               |
| -------------------------- | ---------------------- | ---------------------------- | --------------------------------------------------------------------------- |
| **Emergency Crimson**      | `oklch(0.62 0.22 25)`  | `--primary`, `--destructive` | Primary emergency CTA ("Laporkan Kebakaran"), high severity, critical fires |
| **Safety Ember**           | `oklch(0.78 0.18 70)`  | `--warning`                  | NASA FIRMS satellite hotspots, active verification, unconfirmed alerts      |
| **Field Verified Emerald** | `oklch(0.72 0.17 150)` | `--success`                  | Confirmed incident by moderator, official extinguishing completion          |
| **Dispatch Sky**           | `oklch(0.68 0.16 230)` | `--info`                     | Agency forwarded notification ("Diteruskan ke Damkar"), en-route status     |

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

---

## 5. Bahasa Indonesia Quality Standards (`bahasa-skills`)

All UI copy must adhere strictly to the rules of `bahasa-inti` and `bahasa-website`:

- **Zero AI-Slop Buzzwords:** Banned words include _hiruk pikuk_, _lanskap_, _menyelami_, _krusial_, _mulus_, _tangguh_, _garda terdepan_, _permadani_, _di era digital_.
- **Direct & Action-Oriented Microcopy:** Use standard Indonesian verb imperatives on buttons: _"Kirim Laporan"_, _"Lacak Status"_, _"Buka Peta"_, _"Verifikasi Bukti"_.
- **No Em-Dash Styling:** Never use em dashes (`—`) as decorative punctuation in UI labels or alert descriptions.
- **Proper Sentence Case:** Headings use standard Indonesian capitalization (capitalize first word and proper nouns only), never Title Case on every word.
