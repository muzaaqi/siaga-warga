---
name: audit-plan
description: Audit an implementation plan file in docs/plans/ against PRD.md, AGENTS.md, DESIGN.md, and WIA 2026 competition rubric. Evaluates sequence diagrams, TanStack Start server functions, PostGIS spatial queries, R2 presigned URLs, shadcn UI architecture, TDD test rigor, and PII protection. Produces a detailed pass/fail audit report without modifying the plan file.
argument-hint: "<path to plan file, e.g. docs/plans/02-report-form-and-r2.md>"
---

# /audit-plan

Perform a thorough, objective audit of an implementation plan in `docs/plans/` before execution begins.

> **Note:** This skill is read-only. It inspects the target plan file against repository standards and produces a structured Pass/Fail report with actionable remediation.

## Usage

```
/audit-plan $ARGUMENTS
```

**Examples:**
```
/audit-plan docs/plans/00-workspace-setup.md
/audit-plan docs/plans/01-landing-and-education.md
/audit-plan docs/plans/02-report-form-and-r2.md
/audit-plan docs/plans/03-postgis-spatial-clustering.md
```

---

## Step 1 — Load Reference Sources

Read the target plan file and cross-reference:
1. **Target Plan:** `docs/plans/NN-<feature-name>.md`
2. **`PRD.md`:** Feature scope, status state machine, PostGIS spatial deduplication rules, NASA FIRMS logic.
3. **`AGENTS.md`:** Architecture rules (Rules 1-15: ServerFn only, PostGIS spatial queries, direct R2 presigned URLs, mandatory photo, zero PII leakage, Bun commands, ESLint, team conflict rules).
4. **`DESIGN.md`:** Design tokens (OKLCH, zero gradients, zero emojis), Base UI primitives, responsive drawer/dialog overlays, emergency disclaimers.
5. **`bahasa-skills` (`.agents/skills/bahasa-inti/` & `bahasa-website/`):** Quality standards for Indonesian UX microcopy, anti-slop rules, no em-dash styling, and human-centered wording.

---

## Step 2 — Audit Checklist (6 Critical Dimensions)

Evaluate the target plan across these 6 dimensions:

### Dimension 1 — Use Cases & Sequence Diagrams
- [ ] Every primary interaction (citizen report, spatial cluster check, moderator triage, public timeline) has a dedicated Mermaid sequence diagram.
- [ ] Diagram accurately portrays client-server-DB interactions (Client $\rightarrow$ Server Function $\rightarrow$ Neon PostGIS / Cloudflare R2 / NASA FIRMS).
- [ ] Direct R2 presigned URL upload flow is clearly mapped (client uploads directly to R2, not buffering inside Cloudflare Worker).

### Dimension 2 — Fullstack Data Flow, Server Functions & Anti-Conflict Architecture
- [ ] All database queries and external API calls reside inside `createServerFn`, never on the client.
- [ ] Input data is validated by a Zod schema via `.validator()`.
- [ ] Geospatial deduplication explicitly utilizes PostGIS `ST_DWithin` queries within 2,000m and 4-hour window.
- [ ] Database tables follow modular Drizzle schemas in `src/server/db/schema/` (avoiding mono-schema collisions).
- [ ] `src/routeTree.gen.ts` is omitted from the implementation file list (strictly gitignored).
- [ ] TanStack Query keys are cleanly declared with explicit invalidation rules on mutation.

### Dimension 3 — UI/UX Design & shadcn Composition (DESIGN.md & bahasa-skills)
- [ ] UI components strictly adhere to shadcn with **Base UI** primitives (not Radix UI).
- [ ] Modal/Sheet surfaces use `responsive-overlay` (Drawer <768px, Dialog ≥768px).
- [ ] Zero hardcoded hex colors; tokens from `DESIGN.md` use OKLCH and map to semantic variables.
- [ ] Zero gradients and zero emojis in system UI text.
- [ ] Prominent emergency disclaimer banner (112 / 113) and photo safety warning are included where appropriate.
- [ ] Empty states, loading skeletons, and error boundaries are explicitly specified.
- [ ] **Indonesian Language Audit (bahasa-skills):** All button copy, placeholders, status labels, and error messages comply with `bahasa-inti` and `bahasa-website` (zero AI slop like *hiruk pikuk* or *di era digital*, no decorative em dashes, and clear imperative action labels).

### Dimension 4 — Cybersecurity, Safety & PII Protection
- [ ] **Zero PII Leakage:** Citizen reporter's phone number and exact residential GPS coordinates are never returned in public tracking endpoints (coordinates blurred/jittered to kelurahan level 500m–1km).
- [ ] **File Upload Security:** Direct R2 uploads use presigned PUT URLs with content-type restriction and file size limits (max 5 MB).
- [ ] **Audit Trail Immutability:** Any moderator status modification logs into `report_status_history` with actor, timestamp, and mandatory `reason_note`.

### Dimension 5 — TDD Rigor & Testing Strategy
- [ ] Plan specifies unit tests for Zod schemas and spatial helper functions using `bun test`.
- [ ] Plan specifies integration test coverage for server function business logic with mock DB / mock R2.
- [ ] Quality gates (Tests $\rightarrow$ ESLint $\rightarrow$ Typecheck $\rightarrow$ Build) are mandated.

### Dimension 6 — Competition Feasibility & Milestone Alignment
- [ ] Meets WIA 2026 scoring rubric (Fungsionalitas 25%, Desain 20%, Konten 20%, Orisinalitas 20%, Kesesuaian Tema 15%).
- [ ] Compatible with the timeline: Features needed for First Draft (1 Nov) vs Final (11 Nov) are properly scoped.

---

## Step 3 — Generate Audit Report

Generate a structured markdown audit report:

```markdown
# Audit Report: [Plan Name]

## Verdict: [PASS / CONDITIONAL PASS / FAIL]

### Score Summary
| Dimension | Status | Notes |
|---|---|---|
| 1. Use Cases & Sequence Diagrams | PASS/FAIL | ... |
| 2. Fullstack Data Flow & ServerFn | PASS/FAIL | ... |
| 3. UI/UX & DESIGN.md | PASS/FAIL | ... |
| 4. Security & Zero PII Leakage | PASS/FAIL | ... |
| 5. TDD Rigor & Testing | PASS/FAIL | ... |
| 6. Competition Rubric Alignment | PASS/FAIL | ... |

### Critical Issues (Must Fix Before Execution)
- [Issue 1]: Description and exact remediation.

### Minor Improvements (Recommended)
- [Suggestion 1]: Description.

### Recommendation for Pilot
- [Proceed with /execute-plan OR Revise plan first]
```
