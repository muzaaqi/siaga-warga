---
name: execute-plan
description: Execute an approved implementation plan file in docs/plans/ for SiagaWarga. Enforces strict layer-by-layer TDD execution (Zod schemas -> PostGIS Drizzle models -> Server functions -> UI components -> Tests), commits per layer, and enforces all 4 quality gates (Tests, ESLint, Typecheck, Build).
argument-hint: "<path to plan file, e.g. docs/plans/02-report-form-and-r2.md>"
---

# /execute-plan

Execute an approved feature plan file from start to finish.

## Usage

```
/execute-plan $ARGUMENTS
```

**Examples:**
```
/execute-plan docs/plans/00-workspace-setup.md
/execute-plan docs/plans/01-landing-and-education.md
/execute-plan docs/plans/02-report-form-and-r2.md
```

---

## Step 0 — Pre-Execution Checks

Before touching any code:

1. **Verify Plan Exists & Is Approved:**
   Open the target plan file and ensure it does not contain a blocking status.
2. **Verify Dependencies:**
   Confirm all plans listed in the plan's `Dependencies` section are implemented.
3. **Verify Git Branch:**
   Ensure working directory is clean:
   ```bash
   git status
   ```
   Create and switch to feature branch if appropriate:
   ```bash
   git checkout -b feat/<plan-name>
   ```

---

## Step 1 — Layer-by-Layer Execution (TDD Flow)

Execute the plan strictly in this layer order. Never skip layers or jump ahead to UI before data contracts are established.

### Layer 1: Schemas & Zod Types (`src/lib/schema/`)
- Define input, output, and entity validation schemas.
- Export inferred TypeScript types via barrel (`~/lib/schema`).
- Write unit tests for schema validation edge cases (`bun test src/lib/schema/`).

### Layer 2: Database Models & Migrations (`src/server/db/schema/`)
- Define Drizzle tables in modular files (`reports.ts`, `evidence.ts`, `hotspots.ts`, etc.) inside `src/server/db/schema/`.
- Re-export all schemas in `src/server/db/schema/index.ts`.
- Apply changes to local/dev Neon branch:
  ```bash
  bun run db:push
  ```
- *Note:* Official migration generation (`bun run db:generate`) is reserved for the Pilot to prevent migration number collisions across the team.

### Layer 3: Server Functions & Services (`src/server/functions/`, `src/server/services/`)
- Implement `createServerFn` with strict `.validator()` using Zod schemas.
- Implement PostGIS spatial deduplication queries (`ST_DWithin` within 2 km and 4 hours).
- Implement Cloudflare R2 presigned URL generation.
- Implement NASA FIRMS API ingestion with 6-hour cache in Neon PostGIS.
- Write unit/integration tests for server functions using mock context.

### Layer 4: UI Components & Routes (`src/components/`, `src/routes/`)
- **MANDATORY PRE-REQUISITE:** Load and review `bahasa-skills` (`.agents/skills/bahasa-inti/` and `bahasa-website/`) before drafting any user-facing text, button labels, form placeholders, error notices, or empty states. Ensure zero AI slop, no em-dash styling, and natural Indonesian phrasing.
- Implement UI components using shadcn/ui with Base UI primitives (`@base-ui/react`) and `DESIGN.md` OKLCH tokens.
- Never use color gradients, emojis in system text, or native `<a>`/`<img>` elements.
- Implement interactive forms using TanStack Form (photo upload is mandatory).
- Implement map visualizers with MapLibre GL (dual-layer support).
- Colocate domain components in `src/components/` and route files in `src/routes/`.
- Ensure mobile-first responsive overlays (<768px Drawer / ≥768px Dialog).
- Ensure loading skeletons, error boundaries, and empty states.

---

## Step 2 — Quality Gates (Mandatory)

Run all 4 quality gates in order. All must pass with zero warnings/errors before declaring completion:

```bash
# Gate 1: Tests
bun test

# Gate 2: Code Quality & Design System Lint (Prettier + ESLint + @shadcn/lint)
bun run check
bun run lint

# Gate 3: Typecheck
bun run typecheck

# Gate 4: Production Build
bun run build
```

---

## Step 3 — Commit Changes

Commit cleanly using Conventional Commits:

```bash
git add .
git commit -m "feat(<scope>): <description of changes from plan>"
```
