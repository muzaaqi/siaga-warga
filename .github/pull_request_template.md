## Ringkasan Perubahan

<!-- Jelaskan secara singkat dan padat apa yang diimplementasikan atau diperbaiki -->

- **Fitur / Perbaikan:**
- **Plan Rujukan:** `docs/plans/NN-<feature-name>.md`
- **Bagian PRD:**

---

## Checklist Pra-Merge (Wajib Dicentang Sebelum Merge)

### 1. Alur Kerja Git & Kolaborasi (Section 3)

- [ ] Dikerjakan pada branch baru dari `main` (`feat/*`, `fix/*`, `chore/*`).
- [ ] **Zero Direct Commit to `main`:** Tidak ada commit langsung ke `main`.
- [ ] **Zero Local Merge:** Tidak di-merge manual di lokal; penggabungan dilakukan melalui PR ini.
- [ ] Telah menjalankan `git pull --rebase origin main` sebelum membuka PR.
- [ ] File auto-generated `src/routeTree.gen.ts` **TIDAK** masuk ke dalam commit/staged git.

### 2. Standar Desain & Komponen UI (Rules 10, 11, 12, 13, 14, 16)

- [ ] Menggunakan primitif **Base UI (`@base-ui/react`)**, bukan Radix UI (Rule 10).
- [ ] Seluruh modifikasi komponen dilakukan di `src/components/ui/` (@shadcn/lint enforced, Rule 11).
- [ ] Modal/Sheet menggunakan `responsive-overlay.tsx` (Drawer <768px, Dialog ≥768px, Rule 12).
- [ ] Warna solid flat OKLCH dari `DESIGN.md`; zero gradients (Rule 13).
- [ ] **Universal Zero Emoji Policy (Rule 14):** Bebas dari emoji di seluruh dokumentasi, kode, dan UI. UI wajib menggunakan Lucide React icons (`*Icon`).
- [ ] **Manifest Komponen Shadcn Terverifikasi (Rule 16):** Komponen diperiksa dari `docs/shadcn/components/base/` dan `src/components/ui/`. Tidak ada primitif buatan sendiri (synthetic primitives).

### 3. Mutu Bahasa & UX Copy (Rule 15)

- [ ] **`bahasa-inti`:** Bebas AI-slop (_hiruk pikuk_, _di era digital_, dll.), tanpa em-dash dekoratif, nada manusiawi.
- [ ] **`bahasa-website`:** Label tombol imperatif, pesan error solutif, form validasi ramah pengguna, empty state informatif.
- [ ] **`bahasa-seo`:** Heading hierarkis semantik (H1, H2, H3) dan meta tags untuk rute publik.

### 4. Keamanan, Arsitektur & Edge Runtime (Rules 1, 2, 3, 4, 7, 17, 18, 19, 20)

- [ ] Akses database hanya via `createServerFn` di `src/server/functions/` (Rule 1).
- [ ] Payload divalidasi skema Zod dengan `.validator()` (Rule 2).
- [ ] Upload foto langsung ke R2 via presigned PUT URL (Rule 3 & 4).
- [ ] Kompresi foto sisi client sebelum upload (Rule 20).
- [ ] PII warga (nomor telepon, koordinat presisi rumah) tidak bocor pada rute publik (Rule 7).
- [ ] Kompatibel dengan Cloudflare Workers edge runtime (`workerd`), zero Node.js native packages (Rule 17).
- [ ] Rahasia server terisolasi di `src/server/` dan divalidasi via `env.ts` (Rule 18).
- [ ] Setiap rute mendefinisikan `pendingComponent` (skeleton) dan `errorComponent` (Rule 19).

---

## Hasil Verifikasi Quality Gates (Wajib Lolos 100%)

Jalankan perintah berikut di lokal dan pastikan seluruhnya lulus:

```bash
bun run check        # Prettier style check
bun run lint         # ESLint check
bun run lint:design  # @shadcn/lint check
bun test             # Unit & integration tests
bun run typecheck    # TypeScript strict check
bun run build        # Production client & SSR build
```

- [ ] `bun run check` lulus
- [ ] `bun run lint` & `bun run lint:design` lulus
- [ ] `bun test` lulus
- [ ] `bun run typecheck` lulus
- [ ] `bun run build` lulus
