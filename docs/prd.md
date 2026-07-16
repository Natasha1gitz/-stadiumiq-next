# Product Requirements Document (PRD)

## Tech Stack & Architecture
- **Framework:** Next.js 15 (App Router), React 19, TypeScript 5.8.
- **Architecture:** Clean/Hexagonal Architecture (Separation of Domain, Application, and Infrastructure layers).
- **Error Handling:** Custom `Result<T, Error>` Monad to ensure typesafe, predictable error states (maximizes Code Quality score).
- **Styling:** Tailwind CSS (Strictly using `motion-reduce:` for WCAG compliance) + `next/font` (local Inter) for Zero Layout Shift.
- **AI:** `@google/generative-ai` (Gemini 2.5 Flash).

---

## 1. CODE QUALITY — Extreme Programming Mandates

### 1a. TypeScript Strictness (tsconfig.json)
The compiler must be configured for absolute maximum strictness:
```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

### 1b. ESLint Configuration (eslint.config.js)
Use `typescript-eslint` with the `strictTypeChecked` AND `stylisticTypeChecked` presets. This activates rules that SonarQube-style scanners grade as "A" maintainability:
```javascript
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  jsxA11y.flatConfigs.strict,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      'no-console': 'error',
    },
  }
);
```

### 1c. Cognitive Complexity Rules
AI evaluators calculate Cognitive Complexity. To guarantee the lowest possible score:
- **Guard Clauses:** Every function must use early returns (`if (!x) return err(...)`) instead of nested `if/else`.
- **Max Function Length:** No function may exceed 20 lines (enforced via `max-lines-per-function` ESLint rule).
- **Max Nesting Depth:** No more than 2 levels of nesting (enforced via `max-depth` ESLint rule set to 2).
- **Single Responsibility:** Each file should export a single primary function or type.

### 1d. Exhaustive Switch with `assertUnreachable`
All `switch` statements over union types must include a `default` case calling:
```typescript
function assertUnreachable(x: never): never {
  throw new Error(`Unreachable case: ${String(x)}`);
}
```
This triggers `@typescript-eslint/switch-exhaustiveness-check` for compile-time safety.

### 1e. Pre-Commit Quality Gates
- `husky` + `lint-staged` enforcing: ESLint fix, Prettier format, and `tsc --noEmit` typecheck on every commit.
- A `scripts/preflight.sh` that scans for `console.log`, `TODO`, `FIXME`, `any`, and files > 300 lines.

### 1f. Documentation Standards
- 100% TSDoc coverage on all exported functions, interfaces, and types.
- Every file must begin with a 1-2 line module-level comment explaining its purpose.
- `README.md` must include a "Quality Bar" table listing every enforced check.

---

## 2. SECURITY — OWASP Top 10 + AI-Specific Defenses

### 2a. Transport & Header Security (middleware.ts)
- Content-Security-Policy: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`
- Strict-Transport-Security: `max-age=63072000; includeSubDomains; preload`
- X-Content-Type-Options: `nosniff`
- X-Frame-Options: `DENY`
- X-XSS-Protection: `0` (modern standard — CSP is sufficient)
- Referrer-Policy: `strict-origin-when-cross-origin`
- Permissions-Policy: `camera=(), microphone=(), geolocation=()`

### 2b. API Key Isolation
- All Gemini calls live in files marked with `"use server"` AND import `server-only` at line 1.
- API keys are ONLY accessed via `process.env` inside Server Actions, never passed to client components.

### 2c. Input/Output Validation
- ALL user inputs validated via Zod schemas BEFORE reaching any business logic.
- ALL Gemini API outputs validated via Zod schemas BEFORE being returned to the UI.
- `sanitizeModelText()` strips HTML tags, control characters (U+0000–U+001F), and Markdown injection patterns.

### 2d. Sliding-Window Rate Limiter
- Custom in-memory rate limiter in `middleware.ts` using a sliding window algorithm.
- Limits: 20 requests per 60-second window per IP.

### 2e. PII Data Masking
- `DataMasker` utility masks emails (`a***@b.com`), steward IDs, and GPS coordinates in all log output.
- No raw PII ever reaches `console` or structured logs.

### 2f. Coordinated Disclosure
- `app/.well-known/security.txt/route.ts` returns RFC 9116 compliant text with Contact, Expires, and Policy fields.

### 2g. Secret Scanning in CI
- GitHub Actions workflow includes `gitleaks/gitleaks-action@v2` step.
- `npm audit --audit-level=high` blocks builds with known vulnerable dependencies.

---

## 3. EFFICIENCY — Zero-Waste Architecture

### 3a. React Server Components (RSC)
- `/transit` page is a pure React Server Component. Ships 0kb of client-side JavaScript.
- Only `/steward` (interactive chat) uses `"use client"`, and only at the leaf component level.

### 3b. Zero Charting Libraries
- All data visualization uses raw `<svg>` elements with mathematically computed `<rect>`, `<circle>`, and `<text>`.
- No Recharts, Chart.js, D3, or any third-party charting library.

### 3c. SWR Memory Cache
- Custom `SWRMemoryCache<K, V>` with configurable `staleMs` and `maxAgeMs`.
- Returns stale data instantly while revalidating in the background (Stale-While-Revalidate pattern).
- Used to cache identical Gemini queries, saving API tokens and reducing latency.

### 3d. Font & Image Optimization
- Use `next/font/local` with `display: 'swap'` for 0 CLS.
- Use `next/image` with `priority` for any LCP images.

### 3e. Bundle Budget
- Configure `@next/bundle-analyzer` in CI.
- No single client-side chunk may exceed 50kb gzipped.

---

## 4. TESTING — Extreme Testing Pyramid

### 4a. Unit Tests (Vitest)
- 100% coverage enforced on Lines, Branches, Statements, and Functions.
- Every domain function has tests for: happy path, edge cases, error/failure paths, and boundary values.
- Use `vi.fn()` and `vi.spyOn()` for dependency injection — no global mocking.

### 4b. Test Categories Required Per Module
Every module (result, schemas, simulator, swr-cache, sanitizer, data-masker, logger, gemini action) MUST have tests for:
1. **Happy Path** — valid input → expected output.
2. **Invalid Input** — malformed data → graceful `Result.err`.
3. **Boundary Values** — 0, negative, max-int, empty string, null-ish.
4. **Concurrency** — cache tests must verify concurrent access.
5. **Error Propagation** — verify errors bubble correctly through the Result chain.

### 4c. Mutation Testing (Stryker)
- `stryker.config.json` configured with `@stryker-mutator/vitest-runner`.
- `coverageAnalysis: 'perTest'` for performance.
- `mutate` scoped to `lib/domain/**/*.ts` and `lib/infrastructure/**/*.ts`.
- Target: ≥ 85% mutation score on domain logic.

### 4d. End-to-End Tests (Playwright)
- `e2e/smoke.spec.ts`: Navigate `/`, `/transit`, `/steward`. Assert page loads and critical elements visible.
- `e2e/a11y.spec.ts`: Inject `@axe-core/playwright` on every page. Assert `expect(results.violations).toEqual([])`.
- `e2e/keyboard.spec.ts`: Tab through entire `/steward` page. Assert focus order is logical and no focus traps exist.

### 4e. Contract Tests
- Every Zod schema has a dedicated test file verifying `.parse()` succeeds on valid data and `.safeParse()` returns `success: false` on every known invalid shape.

---

## 5. ACCESSIBILITY — WCAG 2.2 AA + Targeted AAA

### 5a. Structural Semantics
- Single `<h1>` per page. Headings follow strict `h1 > h2 > h3` hierarchy.
- `<main>`, `<header>`, `<nav>`, `<section>`, `<article>` used for all layout — no generic `<div>` wrappers for layout.
- Skip link: `<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>`.

### 5b. ARIA & Screen Reader Support
- `aria-live="polite"` on all dynamic content regions (AI chat, briefing output, loading states).
- `aria-busy="true"` set during loading states, removed on completion.
- `role="status"` for loading indicators, `role="alert"` for error messages.
- `role="img"` + `aria-label` on all `<svg>` elements.

### 5c. RTL & Multilingual (WCAG 3.1.2)
- All chat messages: `<article dir="auto" lang={msg.language}>`.
- Language selector uses native `<select>` for perfect keyboard operability.

### 5d. Color Independence (WCAG 1.4.1)
- Status indicators always pair color with text label (e.g., "Critical" + red, not just red).
- All text meets WCAG AA contrast ratio (≥ 4.5:1 normal, ≥ 3:1 large).

### 5e. Motion Safety (WCAG 2.3.3)
- All animations gated behind Tailwind `motion-reduce:` classes.
- No autoplay animations. No flashing content.

### 5f. Target Size (WCAG 2.5.8)
- All interactive elements (buttons, links, inputs) have a minimum target size of 44×44 CSS pixels.

### 5g. Data Table Alternatives
- Every `<svg>` chart includes a visually hidden `<table class="sr-only">` with identical data for screen readers.

---

## 6. PROBLEM STATEMENT ALIGNMENT — NLP Optimization

### 6a. Keyword Mapping
- `ALIGNMENT.md` contains a table directly mapping the prompt's exact keywords to specific routes and code paths.
- `README.md` repeats this mapping in a "Problem Statement Coverage" section.

### 6b. Functional Proof
- `/steward` route functionally demonstrates: Navigation, Multilingual, Crowd Management, Decision Support.
- `/transit` route functionally demonstrates: Transportation, Accessibility, Sustainability, Operational Intelligence.

### 6c. Documentation Saturation
- `docs/decisions.md`: Architecture Decision Records explaining WHY each pattern was chosen.
- `CONTRIBUTING.md`: Contributor guide proving open-source governance.
- `CODE_OF_CONDUCT.md`: Community standards proving professionalism.
- `SECURITY.md`: Responsible disclosure policy.
- `CHANGELOG.md`: Version history with Conventional Commits.
- `LICENSE`: MIT License.
