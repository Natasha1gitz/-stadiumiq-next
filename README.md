<div align="center">
  <h1>🏟️ StadiumIQ Next</h1>
  <p><strong>FIFA 2026 World Cup — Matchday Command & Control Platform</strong></p>
  
  [![CI](https://img.shields.io/badge/CI-passing-success)](#)
  [![Coverage](https://img.shields.io/badge/coverage-100%25-success)](#)
  [![Mutation Score](https://img.shields.io/badge/mutation-81%25-blue)](#)
  [![Accessibility](https://img.shields.io/badge/a11y-WCAG%202.2%20AA-success)](#)
  [![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
  [![Next.js](https://img.shields.io/badge/Next.js-16.2.10-black)](#)
</div>

<br />

StadiumIQ Next is a production-grade command and control platform designed for the FIFA 2026 World Cup. It delivers real-time crowd management, multilingual steward dispatch, accessible transit routing, and sustainability tracking — all built on a strict clean architecture with zero compromises on code quality, security, or accessibility.

---

## 📋 Problem Statement Coverage

This table maps each FIFA 2026 problem statement requirement directly to its implementation:

| Requirement | Route | Implementation |
|:---|:---|:---|
| **Stadium Navigation** | `/steward` | Gemini-powered wayfinding chat answers gate, section, and route queries |
| **Transportation** | `/transit` | Live dashboard with EV shuttle tracking, metro hub load, and WAV routing |
| **Crowd Management** | `/transit` | Deterministic SVG heatmap with `comfortable`/`busy`/`critical` status labels |
| **Accessibility** | All routes | WCAG 2.2 AA: skip link, `aria-live`, 44px targets, `sr-only` data tables, axe-core verified |
| **Multilingual Assistance** | `/steward` | 5 languages (en/es/fr/pt/ar) with `dir="auto"` RTL support and native `<select>` |
| **Sustainability** | `/transit` | Carbon offset %, EV shuttle count, water refill stations, WAV availability |
| **Operational Intelligence** | `/transit` | AI Dispatch button generates steward briefing orders from live transit context |
| **Real-time Decision Support** | `/transit` | Server Action passes live `TransitData[]` to Gemini for crowd mitigation strategies |

---

## 🏗️ Architecture

```text
src/
├── app/                  # Next.js 16 App Router (RSC + Server Actions)
│   ├── actions/          # Server Actions (Gemini LLM integration)
│   ├── .well-known/      # RFC 9116 security.txt endpoint
│   ├── steward/          # Steward Dispatch route
│   └── transit/          # Transit Command Dashboard route
├── components/           # UI layer (Client & Server Components)
├── lib/
│   ├── domain/           # Pure business logic (Result monad, Zod schemas, simulator)
│   └── infrastructure/   # External integrations (SWR cache, logger, sanitizer)
└── proxy.ts              # Next.js 16 Edge Middleware (CSP + rate limiting)
```

**Key patterns:**
- **Clean/Hexagonal Architecture** — domain logic has zero framework imports
- **Result Monad** — `ok()`/`err()` instead of `try/catch` for flat control flow
- **Zod Boundary Validation** — all inputs/outputs validated at the boundary
- **React Server Components** — `/transit` ships 0kb client JS; only chat is `"use client"`

---

## 🛡️ Security

| Defense | Implementation |
|:---|:---|
| Content Security Policy | Strict CSP blocking all external scripts via Edge middleware |
| HSTS | `max-age=63072000; includeSubDomains; preload` |
| Rate Limiting | Sliding-window (20 req/min per IP) in `proxy.ts` |
| Input Validation | Zod schemas on all user input before business logic |
| Output Sanitization | `sanitizeModelText()` strips HTML, control chars, Markdown injection |
| PII Masking | `maskPII()` redacts emails, steward IDs, GPS coordinates from logs |
| API Key Isolation | `"use server"` + `server-only` — key never reaches client |
| Coordinated Disclosure | RFC 9116 `/.well-known/security.txt` |
| Dependency Scanning | `npm audit` in CI pipeline |

See [SECURITY.md](SECURITY.md) for full details.

---

## 🧪 Quality Bar

| Check | Command | Threshold | Status |
|:---|:---|:---|:---|
| TypeScript strict | `npm run typecheck` | Zero errors | ✅ |
| ESLint | `npm run lint` | Zero errors | ✅ |
| Unit coverage | `npm run test:coverage` | 100% lines/branches/functions/statements | ✅ |
| Mutation testing | `npm run test:mutation` | ≥ 80% kill rate | ✅ 81% |
| E2E smoke | `npm run test:e2e` | All pass | ✅ |
| Accessibility | `npm run test:e2e` (axe-core) | Zero violations | ✅ |
| Build | `npm run build` | Zero errors (Turbopack) | ✅ |

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local (optional — falls back to mock)

# Run development server
npm run dev

# Run full quality pipeline
npm run typecheck
npm run lint
npm run test:coverage
npm run build
npm run test:e2e
```

---

## 📄 Documentation

| Document | Purpose |
|:---|:---|
| [docs/prd.md](docs/prd.md) | Product Requirements — all metric mandates |
| [docs/architecture.md](docs/architecture.md) | System architecture and layer boundaries |
| [docs/decisions.md](docs/decisions.md) | Architecture Decision Records (ADRs) |
| [docs/test-plan.md](docs/test-plan.md) | Test module inventory (60+ test cases) |
| [docs/ALIGNMENT.md](docs/ALIGNMENT.md) | Problem Statement → Code alignment matrix |
| [SECURITY.md](SECURITY.md) | Security policy and vulnerability disclosure |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contributor guide and quality standards |
| [CHANGELOG.md](CHANGELOG.md) | Version history with Conventional Commits |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Community standards |
| [LICENSE](LICENSE) | MIT License |

---

## 📜 License

[MIT](LICENSE) © 2026 StadiumIQ Next Contributors
