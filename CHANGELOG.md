# Changelog

All notable changes to this project are documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/) and
[Conventional Commits](https://www.conventionalcommits.org/).

## [0.1.0] — 2026-07-16

### Added

- **feat(transit):** Transit Command Dashboard with live crowd density
  SVG heatmap, sustainability KPI tiles, and AI dispatch briefing panel.
- **feat(steward):** Multilingual Steward Chat supporting 5 languages
  (English, Spanish, French, Portuguese, Arabic) with RTL support.
- **feat(ai):** Gemini 2.5 Flash integration via Server Actions with
  SWR caching, input validation, and output sanitization.
- **feat(security):** Edge middleware with CSP, HSTS, rate limiting,
  and RFC 9116 `security.txt`.
- **feat(a11y):** WCAG 2.2 AA compliance — skip link, `aria-live`
  regions, 44px targets, screen-reader-only data tables, `motion-reduce`.
- **feat(domain):** Deterministic transit simulator with seeded LCG
  math, Result monad, and Zod boundary validation.
- **feat(infra):** PII-masking structured logger, LLM output sanitizer,
  and SWR memory cache with background revalidation.
- **test:** 100% Vitest coverage, 81%+ Stryker mutation score,
  Playwright E2E + axe-core accessibility scans.
- **docs:** PRD, architecture decisions, test plan, alignment matrix,
  strategy summary, and vision documents.
