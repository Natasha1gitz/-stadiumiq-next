# AI Developer Execution Plan

**CRITICAL INSTRUCTIONS FOR AI:**
- You are optimizing for static analysis metrics: Code Quality, Security, Efficiency, Testing, Accessibility, Alignment.
- Read ALL files in `docs/` before writing ANY code: `vision.md`, `prd.md`, `architecture.md`, `ALIGNMENT.md`, `test-plan.md`, `decisions.md`.
- Do NOT build fancy CSS UI. Keep styling brutalist, clean, and semantic.
- Stop and wait for my explicit approval after completing each task.
- Follow the `Result<T, E>` monad pattern defined in `architecture.md` for ALL domain/infrastructure functions.
- Every function MUST have TSDoc comments with `@param`, `@returns`, and `@example` tags.
- Maximum function length: 20 lines. Maximum nesting depth: 2. Use guard clauses exclusively.
- Every module MUST have tests matching the exact test cases in `test-plan.md`.

---

* [ ] **Task 1: Next.js Foundation, TypeScript Strictness & Elite Security Controls**
  - Initialize Next.js 15 with App Router, TypeScript, Tailwind CSS, ESLint.
  - Configure `tsconfig.json` with ALL strict flags from `prd.md` section 1a.
  - Configure `eslint.config.js` with `strictTypeChecked` + `stylisticTypeChecked` + `jsx-a11y/strict` + ALL rules from `prd.md` section 1b. Add `max-depth: 2`, `max-lines-per-function: 20`, `no-else-return: error`.
  - Install and configure `husky` + `lint-staged` (lint, format, typecheck on commit).
  - Create `scripts/preflight.sh` scanning for `console.log`, `TODO`, `FIXME`, `any`, and files > 300 lines.
  - Create `middleware.ts` with: strict CSP (no `unsafe-inline` for scripts), HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy, AND a Sliding-Window Rate Limiter (20 req/60s/IP).
  - Create `app/.well-known/security.txt/route.ts` returning RFC 9116 text.
  - Create `lib/infrastructure/logger.ts` with `DataMasker` utility (masks emails, steward IDs `STW-XXXX`, GPS coords).
  - Configure `vitest.config.ts` enforcing exactly 100% coverage on lines, functions, statements, and branches.
  - Write tests for `middleware.ts` (all 8 cases from `test-plan.md`).
  - Write tests for `DataMasker` (all 7 cases from `test-plan.md`).
  - *Wait for approval.*

* [ ] **Task 2: Core Domain — Result Monad, Schemas & Simulator**
  - Create `lib/domain/result.ts` with `Result<T, E>`, `ok()`, `err()`, and `assertUnreachable()`.
  - Create `lib/domain/schemas.ts` with Zod schemas for `TransitData`, `StewardQuery`, `LLMResponse`. Include `SupportedLanguage` union type.
  - Create `lib/domain/simulator.ts` using seeded pure math to generate deterministic `TransitData`. Returns `Result` type. Guard clauses for invalid input.
  - Write ALL tests from `test-plan.md` for: Module 1 (result, 7 tests), Module 2 (schemas, 14 tests), Module 3 (simulator, 10 tests).
  - Verify: `npm run test:coverage` passes with 100% on all thresholds.
  - *Wait for approval.*

* [ ] **Task 3: Infrastructure — SWR Cache, Sanitizer & AI Server Action**
  - Create `lib/infrastructure/swr-cache.ts` implementing Stale-While-Revalidate with generic `Map<K, {value, timestamp, stale}>`. Include `get()`, `set()`, `delete()`, `clear()`.
  - Create `lib/infrastructure/sanitize-model.ts` stripping HTML tags, control chars, and `javascript:` URIs.
  - Create `app/actions/gemini.ts` with `"use server"`. Import `server-only` at line 1. Validate input with Zod, check SWR cache, call Gemini, sanitize output, validate with Zod, return `Result`.
  - Write ALL tests from `test-plan.md` for: Module 4 (swr-cache, 10 tests), Module 5 (sanitizer, 9 tests), Module 7 (gemini action, 8 tests).
  - Verify: `npm run test:coverage` still at 100%.
  - *Wait for approval.*

* [ ] **Task 4: Zero-Dependency SVG Transit Command (`/transit`)**
  - Create `app/transit/page.tsx` as a React Server Component (no `"use client"`).
  - Use `next/font/local` for Inter font with `display: 'swap'`.
  - Fetch data from `simulator.ts` directly (server-side, no API call).
  - Build `components/TransitHeatmap.tsx`: Raw `<svg>` with `<rect>` elements. Opacity = `crowdLevel / capacity`. Add `role="img"` and `aria-label`.
  - Build `components/SustainabilityStats.tsx`: Semantic HTML stat tiles (EV count, carbon offset, WAV wait time).
  - Add a visually hidden `<table className="sr-only">` with identical data for screen readers.
  - Use proper heading hierarchy: single `<h1>`, `<h2>` for sections.
  - Add "AI Dispatch" button triggering Server Action with `aria-live="polite"` output region and `aria-busy` during loading.
  - Ensure all interactive elements are ≥ 44×44 CSS pixels.
  - *Wait for approval.*

* [ ] **Task 5: Multilingual Steward UI (`/steward`)**
  - Create `app/steward/page.tsx` — use `"use client"` ONLY on the chat component, not the page.
  - Build `components/StewardChat.tsx` (Client Component): input field, submit button, message list.
  - Language selector: native `<select>` with `<label>` for keyboard accessibility.
  - Chat messages: `<article dir="auto" lang={msg.language}>` for RTL Arabic support.
  - Quick action buttons: `<button type="button">` with descriptive text, ≥ 44×44px target size.
  - Loading state: `<p role="status" aria-live="polite" aria-busy="true">` during AI generation.
  - Error state: `<p role="alert">` for errors.
  - All animations gated behind `motion-reduce:transition-none motion-reduce:animate-none`.
  - *Wait for approval.*

* [ ] **Task 6: The Extreme Testing Mandate**
  - Create `e2e/smoke.spec.ts`: 4 tests from `test-plan.md` E2E section.
  - Create `e2e/a11y.spec.ts`: 3 axe-core tests asserting `violations.length === 0` on every page.
  - Create `e2e/keyboard.spec.ts`: 4 keyboard navigation tests from `test-plan.md`.
  - Configure `stryker.config.json` with `@stryker-mutator/vitest-runner`, `coverageAnalysis: 'perTest'`, `mutate: ['lib/domain/**/*.ts', 'lib/infrastructure/**/*.ts']`.
  - Final verification: `npm run test:coverage` = 100%. `npm run test:e2e` = all pass. `npm run test:mutation` = ≥ 85% score.
  - *Wait for approval.*

* [ ] **Task 7: Documentation & Repository Polish**
  - Create `README.md` with: project description, tech stack table, "Problem Statement Coverage" matrix (copy from `ALIGNMENT.md`), "Quality Bar" table, setup instructions.
  - Create `CONTRIBUTING.md` with: branching strategy, commit conventions (Conventional Commits), PR checklist.
  - Create `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1).
  - Create `SECURITY.md` with responsible disclosure policy.
  - Create `CHANGELOG.md` with initial release entry.
  - Create `LICENSE` (MIT).
  - Create `.github/workflows/ci.yml` with: checkout, setup-node, `gitleaks`, `npm audit`, `npm run lint`, `npm run typecheck`, `npm run test:coverage`, `npm run build`, `npm run test:e2e`.
  - Create `.github/workflows/codeql.yml` for JavaScript/TypeScript SAST.
  - Create `.github/CODEOWNERS`, `.github/dependabot.yml`, `.github/ISSUE_TEMPLATE/bug_report.md`, `.github/ISSUE_TEMPLATE/feature_request.md`, `.github/PULL_REQUEST_TEMPLATE.md`.
  - Verify: entire CI pipeline passes locally.
  - *Wait for approval.*
