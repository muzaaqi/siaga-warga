# AGENTS.md — Technical Operating Manual for SiagaWarga

> **Read this file in full before planning, writing code, or modifying any file in this repository.**  
> This document is the single source of truth for architectural rules, team workflows, and engineering conventions.  
> For product requirements and data models, refer to [`PRD.md`](PRD.md).  
> For visual tokens, typography, and styling, refer to [`DESIGN.md`](DESIGN.md).

---

## 1. Project Overview

**SiagaWarga** is a high-performance *civic reporting and public service tracking* web application for monitoring and verifying wildfire/forest fires (karhutla) and urban residential fires in Indonesia. Developed for **Web In Action (WIA) — Multimedia In Action 2026** under the subtheme *"Public Service Tracking"*.

- **Architecture:** Fullstack standalone web application (non-monorepo, based on `shortU` conventions).
- **Core Philosophy:** **System Honesty** — strict separation between automated input validation, spatial clustering, human-in-the-loop verification, and official handling confirmation.
- **Language Standard:** Indonesian (Bahasa Indonesia) for all user-facing UI, alerts, and tracking copy. Governed strictly by `bahasa-skills` (`bahasa-inti` & `bahasa-website`).

---

## 2. Tech Stack

| Layer | Technology | Specification / Notes |
|---|---|---|
| **Runtime & PM** | **Bun** | `v1.1+` — Package manager, script runner, test runner (`bun test`) |
| **Framework** | **TanStack Start** | React 19 + Vite — Fullstack SSR and streaming on Edge |
| **Routing** | **TanStack Router** | File-based routing in `src/routes/`. `routeTree.gen.ts` strictly gitignored |
| **Data Fetching** | **TanStack Query** | v5 — Server function caching, optimistic updates, SSR hydration |
| **Form Handling** | **TanStack Form** | Controlled form state with granular re-rendering |
| **Schema Validation** | **Zod** | Isomorphic schemas in `src/lib/schema/` |
| **UI Primitives** | **shadcn/ui** with **Base UI** | `@base-ui/react` — **NOT Radix UI** |
| **Styling** | **Tailwind CSS v4** | `@tailwindcss/vite` — OKLCH design tokens mapped to CSS variables |
| **Icons** | **Lucide React** | Latest — Strict `*Icon` imports, zero emojis in system UI |
| **Database** | **Neon PostgreSQL** | Serverless Postgres enabled with **PostGIS** extension |
| **ORM & Migrations** | **Drizzle ORM** | `drizzle-orm` + `drizzle-kit` via `@neondatabase/serverless` |
| **Object Storage** | **Cloudflare R2** | S3 API — Direct browser upload via **Presigned PUT URLs** |
| **Hosting & Edge** | **Cloudflare Workers** | `@cloudflare/vite-plugin` — Low latency Edge compute in Indonesia |
| **Maps & Spatial** | **MapLibre GL JS** | CARTO Positron vector tiles, GeoJSON clustering, dual-layer view |
| **Satellite Hotspots** | **NASA FIRMS API** | Active fire data (VIIRS 375m & MODIS) with 6-hour PostGIS cache |
| **Linter & Formatter** | **ESLint** | Strict TypeScript and React rules |
| **Testing** | **Bun Test** | Native runner for unit and server function integration tests |

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

### 3.5 Short-Lived Branches & Rebase
- Branch naming: `feat/<feature-name>`, `fix/<issue-name>`.
- Branches must not live longer than 1–2 days.
- Always run `git pull --rebase origin main` before opening PRs.

---

## 4. Critical Architecture Rules (Enforced Without Exception)

1. **Rule 1 — Zero Direct DB Access on Client:**  
   Browser components never import `db`. All queries and mutations run inside `createServerFn` in `src/server/functions/`.
2. **Rule 2 — Zod Everywhere:**  
   Every server function must specify `.validator()` with a Zod schema from `src/lib/schema/`. Never accept untyped payloads.
3. **Rule 3 — Direct Cloudflare R2 Upload via Presigned URL:**  
   Photo uploads must never buffer through Cloudflare Workers. The client requests a signed PUT URL via `getPresignedUploadUrl`, uploads directly to R2, and submits the verified object key.
4. **Rule 4 — Mandatory Photo Upload with Safety Disclaimer:**  
   Photo upload is mandatory for citizen reports to eliminate spam. The upload zone must display a prominent safety notice: *"Ambil foto dari jarak aman dan lokasi terlindung! Jangan membahayakan diri mendekati api"*. Photos are compressed client-side (max 5 MB, WebP/JPEG) before upload.
5. **Rule 5 — PostGIS Native Spatial Deduplication & Clustering:**  
   Detecting duplicate reports within 2 km and 4 hours must be executed using PostGIS `ST_DWithin`. Duplicate reports are accepted, linked to the active `cluster_id`, and serve as reinforcing evidence.
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
11. **Rule 11 — Modify UI Components at Source:**  
    Customizations must be made in `src/components/ui/*.tsx`. Avoid inline styling overrides (`!important` or utility soup) at usage sites.
12. **Rule 12 — Responsive Overlays Standard:**  
    All modal dialogs must use `src/components/ui/responsive-overlay.tsx` (Drawer <768px, Dialog ≥768px).
13. **Rule 13 — Zero Gradients & Zero Information Redundancy:**  
    No decorative AI color gradients. Colors are solid, flat, and intentional. No duplicate status badges or echoing headers.
14. **Rule 14 — Zero Emojis in System Copy & Strict Lucide Icons:**  
    Do not use emojis as icons or bullet points in UI text. Use official Lucide React icons (`*Icon`).
15. **Rule 15 — Mandatory `bahasa-skills` Loading for UI Copy:**  
    Before creating or modifying any user-facing text, button labels, form placeholders, error notices, or empty states, the agent **MUST** load and apply `bahasa-inti` (anti-slop, no em-dash styling, no "di era digital", no cliché tripels) and `bahasa-website` (accessible, human UX microcopy).

---

## 5. AI Skills & Development Loop

```
[ Feature Requirement / PRD ]
              │
              ▼
    1. /write-plan ───► Creates docs/plans/NN-<feature>.md
              │
              ▼
    2. /audit-plan ───► Evaluates against AGENTS.md, PRD, DESIGN.md (Pass/Fail)
              │
              ▼ (Once Approved by Pilot)
    3. /execute-plan ──► Executes layer-by-layer (TDD: types -> db -> serverFn -> ui -> tests)
              │
              ▼
    4. Quality Gates ──► Tests -> ESLint -> Typecheck -> Build -> Commit / PR
```

- **/write-plan:** Drafts implementation plans with Mermaid sequence diagrams, Zod schemas, PostGIS queries, server functions, and Bun tests.
- **/audit-plan:** Read-only audit evaluating plans against PRD, AGENTS.md rules, DESIGN.md, and WIA competition rubric.
- **/execute-plan:** Executes approved plans layer-by-layer, strictly following TDD and quality gates.
- **`bahasa-skills` (`bahasa-inti` & `bahasa-website`):** Mandatorily loaded before drafting any UI copy to ensure professional, natural Indonesian without AI-slop.
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
bun run db:studio        # Open Drizzle Studio visual GUI

# Code Quality & Formatting (ESLint)
bun run lint             # ESLint check
bun run lint:fix         # ESLint auto-fix
bun run typecheck        # TypeScript strict typecheck (tsc --noEmit)

# Testing
bun test                 # Run all Bun test suites
bun test --watch         # Run tests in watch mode

# Build & Deployment
bun run build            # Production Vite build
bun run preview          # Preview production build locally
bun run deploy           # Deploy to Cloudflare Workers via Wrangler
```

---

## 8. Code Conventions

### Path Aliases
Always import project files using the `~/` path alias:
```ts
import { db } from "~/server/db";
import { reportSchema } from "~/lib/schema";
import { Button } from "~/components/ui/button";
```

### Type-Safe Links and Routing
Always use TanStack Router's `<Link>` component for internal navigation:
```tsx
import { Link } from "@tanstack/react-router";

<Link to="/lacak/$code" params={{ code: report.trackingCode }}>
  Lihat Status Laporan
</Link>
```

### Documentation and Comments
Every server function and non-trivial helper must contain a JSDoc block stating:
1. Purpose & behavior
2. Input/output constraints
3. Where it is called from
