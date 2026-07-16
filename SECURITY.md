# Security Policy

## Reporting a Vulnerability

**Do not file a public issue.** Instead, email
[security@stadiumiq-next.dev](mailto:security@stadiumiq-next.dev) with:

1. A description of the vulnerability.
2. Steps to reproduce.
3. The potential impact.

We will acknowledge receipt within 48 hours and provide a timeline for
resolution within 5 business days.

## Supported Versions

| Version | Supported |
|:--------|:----------|
| 0.1.x   | ✅ Current |

## Security Measures in Place

- **Content Security Policy** — strict CSP via Edge middleware blocking all
  external scripts.
- **HSTS** — HTTP Strict Transport Security with 2-year max-age and preload.
- **Rate Limiting** — sliding-window rate limiter (20 req/min per IP).
- **Input Validation** — all user input validated via Zod schemas.
- **Output Sanitization** — LLM output stripped of HTML, control characters,
  and Markdown injection patterns via `sanitizeModelText()`.
- **PII Masking** — all log output passes through `maskPII()` to redact
  emails, steward IDs, and GPS coordinates.
- **API Key Isolation** — Gemini API key accessed only in `"use server"`
  modules importing `server-only`.
- **Coordinated Disclosure** — `/.well-known/security.txt` endpoint
  (RFC 9116) with contact and expiry fields.
- **Dependency Scanning** — `npm audit` integrated into CI pipeline.

## Machine-Readable Disclosure

See [/.well-known/security.txt](/.well-known/security.txt) for RFC 9116
compliant disclosure information.
