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
3. **Verify Git Branch (MANDATORY Branching):**
   Ensure working directory is clean and **never** work directly on `main`:
   ```bash
   git status
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
- Ensure Edge runtime compatibility (`workerd`): zero Node.js native APIs (`fs`, `path`, etc.), Web Standards only (Rule 17).
- Isolate server secrets and validate via `src/server/env.ts`; never expose secrets to browser (Rule 18).
- Implement PostGIS spatial deduplication queries (`ST_DWithin` within 2 km and 4 hours).
- Implement Cloudflare R2 presigned URL generation.
- Implement NASA FIRMS API ingestion with 6-hour cache in Neon PostGIS.
- Write unit/integration tests for server functions using mock context.

### Layer 4: UI Components & Routes (`src/components/`, `src/routes/`)
- **MANDATORY PRE-REQUISITE 1 (Indonesian Copy & SEO):** Load and review `bahasa-skills` (`.agents/skills/bahasa-inti/`, `bahasa-website/`, and `bahasa-seo/`) before drafting any user-facing text, button labels, form placeholders, error notices, empty states, or public route copy/meta tags. Ensure zero AI slop, no em-dash styling, clear UX microcopy, and search-optimized semantics.
- **MANDATORY PRE-REQUISITE 2 (Shadcn Component Verification - Rule 16):** Cross-check the plan's component manifest against `src/components/ui/`. If any required primitive is missing, check `docs/shadcn/components/base/<component>.md` and install it using `npx shadcn@latest add <component>` before writing domain UI.
- Implement UI components strictly composing shadcn/ui with Base UI primitives (`@base-ui/react`) and `DESIGN.md` OKLCH tokens.
- **Zero Synthetic Primitives & Maximize Reuse:** Never roll custom modal containers, select popovers, or custom buttons from scratch; maximize reuse of `src/components/ui/` to keep the codebase clean, robust, and concise.
- Never use color gradients, emojis in system text, or native `<a>`/`<img>` elements.
- Implement interactive forms using TanStack Form with mandatory client-side photo pre-compression (Rule 20) and interactive manual map pin fallback for geolocation (Rule 5).
- Implement map visualizers with MapLibre GL (dual-layer support).
- Colocate domain components in `src/components/` and route files in `src/routes/`.
- Ensure mobile-first responsive overlays (<768px Drawer / ≥768px Dialog).
- **Route Resilience (Rule 19):** Ensure every route defines an explicit `pendingComponent` (Base UI skeleton) and `errorComponent` (human-centered recovery UI with retry action). Zero white screens.

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

## Step 3 — Commit, Push & Open Pull Request

1. **Commit Cleanly (Conventional Commits):**
   ```bash
   git add .
   git commit -m "feat(<scope>): <description of changes from plan>"
   ```

2. **Rebase Against Main:**
   ```bash
   git pull --rebase origin main
   ```

3. **Push to Remote & Open Pull Request:**
   ```bash
   git push -u origin feat/<plan-name>
   gh pr create --title "feat(<scope>): <description>" --body "<summary of changes and quality gates>"
   ```

> [!CAUTION]
> **ZERO LOCAL MERGES TO MAIN:**  
> Never run `git merge` or merge feature branches into `main` locally on your machine.  
> Merging to `main` is strictly executed remotely via Pull Request review on GitHub.
