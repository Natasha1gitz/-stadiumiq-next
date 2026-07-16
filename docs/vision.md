# Vision: FIFA 2026 Transport & Steward Intelligence Platform

## Purpose
An ultra-lean, highly secure, serverless application built to manage Accessible Transportation and Steward Dispatching for the FIFA World Cup 2026. The primary goal is elite-level code quality, flawless security, and mathematical efficiency over visual flair.

## Target Personas
1. **Matchday Stewards (`/steward`):** A multilingual interface allowing volunteers to receive real-time, AI-translated dispatch instructions and crowd mitigation strategies.
2. **Transit Command (`/transit`):** A live dashboard monitoring accessible transit hub flow, wheelchair-accessible vehicle (WAV) availability, and sustainability metrics.

## Core Directives (Metric Maximization)

### Code Quality is Supreme
- The UI must be brutally minimalist. Focus heavily on clean code.
- Use Hexagonal Architecture principles with strict layered isolation (Domain → Infrastructure → Application).
- Use the `Result<T, E>` Monad pattern for error handling — zero `try/catch` in domain/infrastructure code.
- Every function must have comprehensive `TSDoc` comments (`@param`, `@returns`, `@example`).
- Maximum function length: 20 lines. Maximum nesting depth: 2. Guard clauses only.
- Exhaustive `switch` statements with `assertUnreachable()`.
- ESLint `strictTypeChecked` + `stylisticTypeChecked` + `jsx-a11y/strict` presets.
- TypeScript strict mode with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`.

### Plagiarism Avoidance
- Do NOT use standard `try/catch` services or `ttl-cache` classes.
- Use Functional Programming error handling and a `Stale-While-Revalidate` (SWR) memory caching strategy.
- Use Hexagonal Architecture, not MVC/Service pattern.

### Zero Heavy Dependencies
- Absolutely no Recharts, Chart.js, D3, or heavy UI frameworks.
- Use semantic HTML and raw `<svg>` for data visualization.
- React Server Components for zero client-side JS on data pages.

### Extreme Testing
- 100% Vitest coverage (lines, branches, statements, functions).
- Every module has tests for: happy path, invalid input, boundary values, concurrency, and error propagation.
- Stryker Mutation Testing on domain and infrastructure layers (≥ 85% mutation score).
- Playwright E2E with `@axe-core/playwright` proving 0 accessibility violations.
- Keyboard navigation E2E tests proving no focus traps.

### Professional Repository Standards
- Architecture Decision Records (`docs/decisions.md`).
- Exhaustive test plan (`docs/test-plan.md`).
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `CHANGELOG.md`, `LICENSE`.
- GitHub Actions CI with `gitleaks`, `npm audit`, CodeQL SAST, Playwright E2E.
- `CODEOWNERS`, `dependabot.yml`, issue templates, PR template.
