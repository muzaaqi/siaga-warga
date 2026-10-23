# AGENTS.md — Technical Operating Manual for SiagaWarga

> **Read this file in full before planning, writing code, or modifying any file in this repository.**  
> This document is the single source of truth for architectural rules, team workflows, and engineering conventions.  
> For product requirements and data models, refer to [`PRD.md`](PRD.md).  
> For visual tokens, typography, and styling, refer to [`DESIGN.md`](DESIGN.md).

---

## 1. Project Overview

**SiagaWarga** is a high-performance _civic reporting and public service tracking_ web application for monitoring and verifying wildfire/forest fires (karhutla) and urban residential fires in Indonesia. Developed for **Web In Action (WIA) — Multimedia In Action 2026** under the subtheme _"Public Service Tracking"_.

- **Architecture:** Fullstack standalone web application (non-monorepo, based on `shortU` conventions).
- **Core Philosophy:** **System Honesty** — strict separation between automated input validation, spatial clustering, human-in-the-loop verification, and official handling confirmation.
- **Language Standard:** Indonesian (Bahasa Indonesia) for all user-facing UI, alerts, and tracking copy. Governed strictly by `bahasa-skills` (`bahasa-inti` & `bahasa-website`).

---

## 2. Tech Stack

| Layer                  | Technology                                   | Specification / Notes                                                                                             |
| ---------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Runtime & PM**       | **Bun**                                      | `v1.1+` — Package manager, script runner, test runner (`bun test`)                                                |
| **Framework**          | **TanStack Start**                           | React 19 + Vite — Fullstack SSR and streaming on Edge                                                             |
| **Routing**            | **TanStack Router**                          | File-based routing in `src/routes/`. `routeTree.gen.ts` strictly gitignored                                       |
| **Data Fetching**      | **TanStack Query**                           | v5 — Server function caching, optimistic updates, SSR hydration                                                   |
| **Form Handling**      | **TanStack Form**                            | Controlled form state with granular re-rendering                                                                  |
| **Schema Validation**  | **Zod**                                      | Isomorphic schemas in `src/lib/schema/`                                                                           |
| **UI Primitives**      | **shadcn/ui** with **Base UI**               | `@base-ui/react` — **NOT Radix UI**                                                                               |
| **Styling**            | **Tailwind CSS v4**                          | `@tailwindcss/vite` — OKLCH design tokens mapped to CSS variables                                                 |
| **Icons**              | **Lucide React**                             | Latest — Strict `*Icon` imports, zero emojis in system UI                                                         |
| **Database**           | **Neon PostgreSQL**                          | Serverless Postgres enabled with **PostGIS** extension                                                            |
| **ORM & Migrations**   | **Drizzle ORM**                              | `drizzle-orm` + `drizzle-kit` via `@neondatabase/serverless`                                                      |
| **Object Storage**     | **Cloudflare R2**                            | S3 API — Direct browser upload via **Presigned PUT URLs**                                                         |
| **Hosting & Edge**     | **Cloudflare Workers** & **Docker (Bun)**    | Cloudflare Workers (`@cloudflare/vite-plugin`) or Docker container (`oven/bun:1-alpine`)                          |
| **Maps & Spatial**     | **MapLibre GL JS**                           | CARTO Positron vector tiles, GeoJSON clustering, dual-layer view                                                  |
| **Satellite Hotspots** | **NASA FIRMS API**                           | Active fire data (VIIRS 375m & MODIS) with 6-hour PostGIS cache                                                   |
| **Linter & Formatter** | **ESLint** + **@shadcn/lint** + **Prettier** | ESLint (TypeScript/React) + `@shadcn/lint` (design system enforcement) + Prettier (`prettier-plugin-tailwindcss`) |
| **Testing**            | **Bun Test**                                 | Native runner for unit and server function integration tests                                                      |

---

## 3. Team Collaboration & Anti-Conflict Workflow

To prevent merge conflicts, migration collisions, and blocking dependencies within the team:

### 3.1 Strict Gitignore of Generated Code

`src/routeTree.gen.ts` must **never** be committed to Git. It is generated locally via `bun run generate-routes` or during dev/build.

### 3.2 Modular Drizzle Schema (`src/server/db/schema/`)

Never put all database definitions into a single `schema.ts`. Schemas are partitioned by domain:

- `src/server/db/schema/reports.ts` — Report records and status fields
- `src/server/db/schema/evidence.ts` — Media uploads and metadata
- `src/server/db/schema/hotspots.ts` — NASA FIRMS satellite cache
- `src/server/db/schema/moderators.ts` — Audit logs and status history
- `src/server/db/schema/index.ts` — Central barrel re-exporting all schemas

### 3.3 Migration Gatekeeper (Pilot Role)

To eliminate Drizzle migration file collisions (`0001_xxx.sql` conflicts), only the **Pilot (Lead)** runs `bun run db:generate` and commits migration files to `main`. Team members work on schema definitions and test against their local/dev branch.

### 3.4 Vertical Feature Slicing

Team members work on isolated feature slices (route + server function + colocated components), avoiding cross-touching the same files:

- **Member 1:** Citizen Reporting (`src/routes/lapor.tsx` + `src/server/functions/reports.ts` + `src/components/report/`)
- **Member 2:** Public Map & Satellites (`src/routes/pantau.tsx` + `src/server/functions/hotspots.ts` + `src/components/map/`)
- **Member 3 / Pilot:** Core Infrastructure, Moderator Triage (`src/routes/admin/` + `src/server/functions/moderator.ts` + `src/components/triage/`)

### 3.5 Mandatory Branching & Pull Request Workflow (Zero Direct Commit to Main)

- **Zero Direct Commit to `main`:** All changes (features, bug fixes, docs, refactoring) must be developed on a dedicated branch created from `main`. Never run `git commit` directly on `main`.
- **Branch Naming Standard:**
  - `feat/<feature-name>` (e.g. `feat/01-landing-page`)
  - `fix/<issue-name>` (e.g. `fix/schema-zod-bounds`)
  - `chore/<task-name>` (e.g. `chore/shadcn-base-docs`)
- **Zero Local Merges to `main`:** Never execute `git merge <branch>` locally into `main`. Merging into `main` must occur exclusively through remote Pull Requests (PR) on GitHub.
- **Short-Lived Branches & Rebase:**
  - Branches must not live longer than 1–2 days.
  - Always run `git pull --rebase origin main` before pushing and opening a PR.
  - Submit changes via PR (`gh pr create` or web PR) with quality gate verification results.

---

## 4. Critical Architecture Rules (Enforced Without Exception)

1. **Rule 1 — Zero Direct DB Access on Client:**  
   Browser components never import `db`. All queries and mutations run inside `createServerFn` in `src/server/functions/`.
2. **Rule 2 — Zod Everywhere:**  
   Every server function must specify `.validator()` with a Zod schema from `src/lib/schema/`. Never accept untyped payloads.
3. **Rule 3 — Direct Cloudflare R2 Upload via Presigned URL:**  
   Photo uploads must never buffer through Cloudflare Workers. The client requests a signed PUT URL via `getPresignedUploadUrl`, uploads directly to R2, and submits the verified object key.
4. **Rule 4 — Mandatory Photo Upload with Safety Disclaimer:**  
   Photo upload is mandatory for citizen reports to eliminate spam. The upload zone must display a prominent safety notice: _"Ambil foto dari jarak aman dan lokasi terlindung! Jangan membahayakan diri mendekati api"_. Photos are compressed client-side (max 5 MB, WebP/JPEG) before upload.
5. **Rule 5 — PostGIS Native Spatial Deduplication & Clustering:**  
   Detecting duplicate reports within 2 km and 4 hours must be executed using PostGIS `ST_DWithin`. Duplicate reports are accepted, linked to the active `cluster_id`, and serve as reinforcing evidence. If browser geolocation fails or returns coordinates outside Indonesian boundaries (e.g. Null Island `0, 0`), the UI must provide a responsive manual map pin picker as a fallback instead of blocking form submission.
6. **Rule 6 — NASA FIRMS 6-Hour Caching in PostGIS:**  
   Satellite hotspot queries check VIIRS/MODIS active fires within a 5 km radius. Ingested data is cached in the `satellite_hotspots` table with a 6-hour TTL to prevent external API quota exhaustion.
7. **Rule 7 — Zero PII Leakage & Coordinate Jittering on Public Routes:**  
   Public tracking endpoints (`/lacak/$code`, `/pantau`) must never expose reporter phone numbers, email addresses, or unblurred residential coordinates. Public map markers are jittered/masked to the kelurahan level (500m–1km). Exact GPS coordinates and camera EXIF are strictly restricted to authenticated moderators.
8. **Rule 8 — Immutable Audit Log on Status Changes:**  
   Every update to `verification_status`, `priority`, or `handling_status` must insert a record into `report_status_history` with the actor, timestamp, and mandatory `reason_note`.
9. **Rule 9 — Multi-Dimensional Status Separation (System Honesty):**  
   Never equate `verified` with `resolved`. Keep `verification_status` (evidence validity), `priority` (urgency for response), and `handling_status` (physical agency intervention) as independent fields.
10. **Rule 10 — Base UI Primitives (NOT Radix UI):**  
    This project uses shadcn with **Base UI (`@base-ui/react`)**. Do not import from `@radix-ui/*`.
11. **Rule 11 — Modify UI Components at Source (@shadcn/lint Enforced):**  
    Customizations must be made in `src/components/ui/*.tsx`. Avoid inline styling overrides (`!important` or utility soup) at usage sites. Enforced statically via `@shadcn/lint` (`shadcn/no-restyle`).
12. **Rule 12 — Responsive Overlays Standard:**  
    All modal dialogs must use `src/components/ui/responsive-overlay.tsx` (Drawer <768px, Dialog ≥768px).
13. **Rule 13 — Zero Gradients & Zero Information Redundancy:**  
    No decorative AI color gradients. Colors are solid, flat, and intentional. No duplicate status badges or echoing headers.
14. **Rule 14 — Universal Zero Emoji Policy & Strict Lucide Icons:**  
    Emojis are strictly prohibited anywhere across the entire repository — including all documentation (`README.md`, `PRD.md`, `DESIGN.md`, `docs/**/*.md`), code comments, commit messages, and PR templates. In the web UI, never use emojis as icons, bullet points, or status indicators; **always use official Lucide React icons (`*Icon`)**.
15. **Rule 15 — Mandatory `bahasa-skills` Loading for UI Copy & Public Content:**  
    Before creating or modifying any user-facing text, button labels, form placeholders, error notices, empty states, or public content, the agent **MUST** load and apply:
    - **`bahasa-inti` (`.agents/skills/bahasa-inti/`):** Core anti-slop rules, no em-dash styling, no "di era digital", no cliché tripels, natural human-centered tone.
    - **`bahasa-website` (`.agents/skills/bahasa-website/`):** Accessible UX microcopy, actionable button labels, clear form validation/error notices, and human empty states.
    - **`bahasa-seo` (`.agents/skills/bahasa-seo/`):** Semantic heading hierarchy (H1, H2, H3), meta titles, meta descriptions, OpenGraph tags, and search intent alignment on public-facing routes (`/`, `/pantau`, `/lacak/$code`).
16. **Rule 16 — Mandatory Shadcn Component Verification & Reuse (Anti-Hallucination):**  
    Before planning, designing, or implementing any user interface, the agent **MUST** inspect local shadcn component documentation in `docs/shadcn/components/base/` and check currently installed primitives in `src/components/ui/`.
    - **Explicit Component Manifest:** Every implementation plan and UI task must explicitly document the list of shadcn Base UI components to be utilized (e.g. `Button`, `Dialog`, `Drawer`, `Card`, `Badge`, `Alert`, `Select`, `Input`, `Tabs`, `Table`, `Tooltip`, `Separator`).
    - **Zero Synthetic Primitives:** Never hallucinate or roll custom HTML/CSS modal dialogs, tooltips, dropdowns, or custom form controls. Always maximize reuse of shadcn Base UI primitives.
    - **Concise Codebase:** New UI views must compose existing components to eliminate redundancy and keep the codebase lean and maintainable.
17. **Rule 17 — Edge Runtime (`workerd`) Compatibility:**  
    All server-side code in `src/server/` and server functions must execute cleanly in Cloudflare Workers runtime (`workerd`). Never import Node.js native packages (`fs`, `path`, `child_process`). Use Web Standards APIs (`fetch`, `crypto.subtle`, `Request`, `Response`, `URL`). Any third-party utility must be pure JavaScript/TypeScript without native binary dependencies.
18. **Rule 18 — Strict Secret Isolation & Type-Safe Environment Variables:**  
    Server secrets (`DATABASE_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `NASA_FIRMS_MAP_KEY`, `ADMIN_PASSCODE`) must NEVER be leaked or imported into client bundles. Only public configuration variables prefixed with `VITE_` are accessible on the browser. Validate all environment variables using a centralized Zod schema (`src/server/env.ts`).
19. **Rule 19 — Route Resilience (Pending Skeletons & Human Error Boundaries):**  
    Every route in `src/routes/` must declare an explicit `pendingComponent` (using Base UI skeletons) and `errorComponent` (resilient error UI with human-centered copy based on `bahasa-website` and an actionable "Coba Lagi" / retry button). Zero unhandled white screens or raw technical error stack traces.
20. **Rule 20 — Client-Side Image Pre-Compression Standard:**  
    To support low-bandwidth rural conditions and prevent storage exhaustion, the browser upload component must compress photos client-side (max dimension 1600px, WebP/JPEG, target size ~500 KB–1 MB, hard capped at 5 MB) via Canvas API or client compression helper before requesting presigned URLs and uploading to Cloudflare R2.

---

## 5. AI Skills & Development Loop

```
[ Feature Requirement / PRD ]
              │
              ▼
    1. /write-plan ───► Verifies docs/shadcn/components/base/ & creates docs/plans/NN-<feature>.md
              │
              ▼
    2. /audit-plan ───► Evaluates against AGENTS.md, PRD, DESIGN.md & shadcn mapping (Pass/Fail)
              │
              ▼ (Once Approved by Pilot)
    3. /execute-plan ──► Executes layer-by-layer (TDD: types -> db -> serverFn -> ui -> tests)
              │
              ▼
    4. Quality Gates ──► Tests -> ESLint -> Typecheck -> Build -> Commit / PR
```

- **/write-plan:** Drafts implementation plans with Mermaid sequence diagrams, Zod schemas, PostGIS queries, server functions, explicit **shadcn Base UI component manifests** verified against `docs/shadcn/components/base/`, and Bun tests.
- **/audit-plan:** Read-only audit evaluating plans against PRD, AGENTS.md rules (including Rule 16 shadcn reuse), DESIGN.md, and WIA competition rubric.
- **/execute-plan:** Executes approved plans layer-by-layer, strictly verifying component manifests, utilizing existing `src/components/ui/` primitives, and following TDD & quality gates.
- **`bahasa-skills` (`bahasa-inti`, `bahasa-website`, `bahasa-seo`):** Mandatorily loaded before drafting any UI copy, meta tags, or public content to ensure professional, natural Indonesian without AI-slop and optimized search semantics.
- **/grill-me:** Interactive interview to stress-test ideas and resolve design decisions with the Pilot before implementation.

---

## 6. Project Structure

```
ON-FIRE/
├── PRD.md                          # Product requirements & data models (source of truth)
├── AGENTS.md                       # This technical operating manual
├── DESIGN.md                       # Visual design system, OKLCH tokens, typography
├── eslint.config.js                # ESLint configuration
├── drizzle.config.ts               # Drizzle ORM config (points to Neon PostGIS)
├── package.json                    # Dependencies & Bun scripts
├── tsconfig.json                   # Strict TypeScript config
├── tsr.config.json                 # TanStack Router generator config
├── vite.config.ts                  # Vite config with TanStack Start & Cloudflare plugin
├── wrangler.jsonc                  # Cloudflare Workers & R2 deployment config
│
├── docs/
│   ├── guides/                     # WIA MIA 2026 Guidebook & Subtheme
│   └── plans/                      # Feature implementation plans (NN-<name>.md)
│
├── src/
│   ├── client.tsx                  # Client-side entry point
│   ├── router.tsx                  # TanStack Router instance & QueryClientProvider
│   ├── ssr.tsx                     # Server-side rendering entry point
│   ├── routeTree.gen.ts            # Auto-generated by TanStack Router (GITIGNORED)
│   │
│   ├── routes/                     # File-based TanStack Router routes
│   │   ├── __root.tsx              # Root shell layout, theme provider, global toast
│   │   ├── index.tsx               # Landing page (hero, emergency banner, live stats)
│   │   ├── lapor.tsx               # Citizen report submission form (mandatory photo)
│   │   ├── pantau.tsx              # Public interactive map & incident explorer (dual-layer)
│   │   ├── lacak.$code.tsx         # Public report tracking & 4-phase audit timeline
│   │   └── admin/
│   │       ├── login.tsx           # Moderator passcode login
│   │       ├── triase.tsx          # Moderator triage command center (priority queue)
│   │       └── laporan.$id.tsx     # Moderator report verification review & status changer
│   │
│   ├── server/
│   │   ├── db/
│   │   │   ├── schema/             # Modular Drizzle schemas (reports, evidence, hotspots, etc.)
│   │   │   │   ├── index.ts
│   │   │   │   ├── reports.ts
│   │   │   │   ├── evidence.ts
│   │   │   │   ├── hotspots.ts
│   │   │   │   └── moderators.ts
│   │   │   └── index.ts            # Neon serverless client (`db`)
│   │   │
│   │   ├── functions/              # TanStack Start Server Functions (`createServerFn`)
│   │   │   ├── reports.ts          # createReport, getPublicReports, getReportByTrackingCode
│   │   │   ├── evidence.ts         # getPresignedUploadUrl, registerEvidence
│   │   │   ├── hotspots.ts         # getActiveHotspots (NASA FIRMS cache)
│   │   │   └── moderator.ts        # getTriageQueue, updateReportStatus, adminLogin
│   │   │
│   │   └── services/               # Reusable server utilities
│   │       ├── r2.ts               # S3 Client & presigned PUT URL generator
│   │       ├── spatial.ts          # PostGIS ST_DWithin query helpers
│   │       ├── nasa-firms.ts       # NASA FIRMS API client with 6-hour cache handling
│   │       └── auth.ts             # Moderator session cookie & verification
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components (Base UI primitives)
│   │   ├── shared/                 # Emergency banner (112/113), header nav, theme toggle
│   │   ├── report/                 # Report form & photo upload components
│   │   ├── map/                    # MapLibre GL map visualizer & dual-layer controls
│   │   ├── timeline/               # 4-Phase audit status timeline for /lacak/$code
│   │   └── triage/                 # Moderator queue cards & evidence viewer
│   │
│   ├── lib/
│   │   ├── schema/                 # Zod validation schemas (barrel import: ~/lib/schema)
│   │   ├── exifr.ts                # Client-side metadata & timestamp extractor
│   │   └── utils.ts                # cn(), formatDate(), formatDistance()
│   │
│   └── styles/
│       └── globals.css             # Tailwind CSS v4 @theme inline mappings (OKLCH)
│
└── drizzle/
    └── migrations/                 # Generated Drizzle migration files
```

---

## 7. Commands

Run all commands from the repository root using **Bun**:

```bash
# Development
bun run dev              # Start development server on port 3000
bun run generate-routes  # Generate TanStack Router route tree

# Database & Migrations (Pilot / Lead only for db:generate)
bun run db:generate      # Generate Drizzle migration files from schema
bun run db:push          # Push schema directly to dev Neon DB (prototyping)
bun run db:migrate       # Apply pending migrations
bun run db:seed          # Seed realistic fire reports & hotspots for testing
bun run db:studio        # Open Drizzle Studio visual GUI

# Code Quality & Formatting (ESLint & Prettier)
bun run lint             # ESLint check (includes @shadcn/lint design system enforcement)
bun run lint:fix         # ESLint auto-fix
bun run lint:design      # Dedicated @shadcn/lint check
bun run format           # Prettier format (with Tailwind class sorting) + ESLint fix
bun run check            # Prettier style check
bun run typecheck        # TypeScript strict typecheck (tsc --noEmit)

# Testing
bun test                 # Run all Bun test suites
bun test --watch         # Run tests in watch mode

# Build & Deployment
bun run build            # Production Vite build
bun run preview          # Preview production build locally
bun run start            # Run production Bun server (bun run server.ts)
bun run deploy           # Deploy to Cloudflare Workers via Wrangler

# Docker Deployment (Bun runtime)
docker build -t siagawarga .                       # Build Docker image
docker run -p 3000:3000 --env-file .env siagawarga # Run container
docker compose up -d --build                       # Run via Docker Compose
```

---

## 8. Code Conventions

### Path Aliases

Always import project files using the `@/` path alias:

```ts
import { db } from '@/server/db'
import { reportSchema } from '@/lib/schema'
import { Button } from '@/components/ui/button'
```

### Type-Safe Links and Routing

Always use TanStack Router's `<Link>` component for internal navigation:

```tsx
import { Link } from '@tanstack/react-router'

;<Link to="/lacak/$code" params={{ code: report.trackingCode }}>
  Lihat Status Laporan
</Link>
```

### Documentation and Comments

Every server function and non-trivial helper must contain a JSDoc block stating:

1. Purpose & behavior
2. Input/output constraints
3. Where it is called from
