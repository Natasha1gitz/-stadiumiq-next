# Exhaustive Test Plan

This document defines the exact test suite required for 100% coverage AND high mutation score.
Every module listed below MUST have ALL listed test cases implemented.

---

## Test Infrastructure

- **Runner:** Vitest 3.x with `@vitest/coverage-v8`.
- **Coverage Thresholds (vitest.config.ts):**
  ```typescript
  coverage: {
    provider: 'v8',
    reporter: ['text', 'lcov', 'html'],
    thresholds: {
      lines: 100,
      branches: 100,
      functions: 100,
      statements: 100,
    },
    include: ['lib/**/*.ts', 'app/**/*.ts'],
    exclude: ['**/*.test.ts', '**/*.spec.ts', '**/e2e/**'],
  }
  ```
- **Mutation Testing:** Stryker with `@stryker-mutator/vitest-runner`, `coverageAnalysis: 'perTest'`.
- **E2E:** Playwright with `@axe-core/playwright`.

---

## Module 1: `lib/domain/result.ts`

| # | Test Case | Category | Assertion |
|---|-----------|----------|-----------|
| 1 | `ok()` wraps value correctly | Happy path | `result.ok === true && result.value === input` |
| 2 | `err()` wraps error correctly | Happy path | `result.ok === false && result.error === input` |
| 3 | `ok()` with undefined value | Edge case | `result.value === undefined` |
| 4 | `ok()` with null value | Edge case | `result.value === null` |
| 5 | `ok()` with complex object | Edge case | Deep equality check |
| 6 | `err()` with string error | Edge case | `result.error === 'message'` |
| 7 | Type narrowing after `if (result.ok)` | Type safety | TypeScript compiles without error |

---

## Module 2: `lib/domain/schemas.ts`

| # | Test Case | Category | Assertion |
|---|-----------|----------|-----------|
| 1 | `TransitDataSchema.parse()` with valid data | Happy path | Returns parsed object |
| 2 | `TransitDataSchema.parse()` with missing field | Invalid input | Throws ZodError |
| 3 | `TransitDataSchema.parse()` with wrong types | Invalid input | Throws ZodError |
| 4 | `TransitDataSchema.parse()` with negative crowd level | Boundary | Throws ZodError (crowd must be ≥ 0) |
| 5 | `TransitDataSchema.parse()` with crowd = 0 | Boundary | Parses successfully |
| 6 | `TransitDataSchema.parse()` with crowd = MAX_SAFE_INTEGER | Boundary | Parses successfully |
| 7 | `StewardQuerySchema.parse()` with valid query | Happy path | Returns parsed object |
| 8 | `StewardQuerySchema.parse()` with empty question | Invalid input | Throws ZodError |
| 9 | `StewardQuerySchema.parse()` with question > 500 chars | Boundary | Throws ZodError |
| 10 | `StewardQuerySchema.parse()` with unsupported language | Invalid input | Falls back to 'en' or throws |
| 11 | `StewardQuerySchema.parse()` with each valid language | Exhaustive | One test per language code |
| 12 | `LLMResponseSchema.parse()` with valid response | Happy path | Returns parsed object |
| 13 | `LLMResponseSchema.parse()` with HTML in answer | Edge case | Still parses (sanitization is separate) |
| 14 | `LLMResponseSchema.parse()` with empty answer | Boundary | Throws ZodError |

---

## Module 3: `lib/domain/simulator.ts`

| # | Test Case | Category | Assertion |
|---|-----------|----------|-----------|
| 1 | Returns `ok` Result with valid hubId and seed | Happy path | `result.ok === true` |
| 2 | Same seed produces same output (determinism) | Invariant | Two calls with same args are deeply equal |
| 3 | Different seeds produce different output | Invariant | Two calls with different seeds differ |
| 4 | Returns `err` for empty hubId | Invalid input | `result.ok === false` |
| 5 | Returns `err` for negative seed | Boundary | `result.ok === false` |
| 6 | Crowd level is between 0 and capacity | Invariant | `0 <= value.crowdLevel <= value.capacity` |
| 7 | EV shuttle count is non-negative | Invariant | `value.evShuttleCount >= 0` |
| 8 | Sustainability metrics are within 0–100% | Invariant | `0 <= value.carbonOffsetPct <= 100` |
| 9 | WAV availability is non-negative | Invariant | `value.wavAvailable >= 0` |
| 10 | Output passes `TransitDataSchema.parse()` | Contract | No ZodError thrown |

---

## Module 4: `lib/infrastructure/swr-cache.ts`

| # | Test Case | Category | Assertion |
|---|-----------|----------|-----------|
| 1 | `get()` returns `undefined` for unknown key | Happy path | `cache.get('x') === undefined` |
| 2 | `set()` + `get()` returns the value | Happy path | Value matches |
| 3 | Returns stale value after `staleMs` | SWR behavior | Returns value, triggers revalidate |
| 4 | Returns `undefined` after `maxAgeMs` | Expiry | `cache.get('x') === undefined` |
| 5 | Concurrent `get()` calls don't trigger multiple revalidations | Concurrency | Revalidator called exactly once |
| 6 | `set()` overwrites existing entry | Edge case | New value returned |
| 7 | `clear()` removes all entries | Cleanup | `cache.get('x') === undefined` |
| 8 | `delete()` removes single entry | Cleanup | Only target key removed |
| 9 | Cache with 0 `staleMs` always revalidates | Boundary | Revalidator always called |
| 10 | Cache with very large `maxAgeMs` never expires in test window | Boundary | Value persists |

---

## Module 5: `lib/infrastructure/sanitize-model.ts`

| # | Test Case | Category | Assertion |
|---|-----------|----------|-----------|
| 1 | Strips `<script>` tags | XSS defense | Output contains no `<script>` |
| 2 | Strips `<img onerror=...>` | XSS defense | Output contains no `<img` |
| 3 | Strips all HTML tags | Sanitization | No `<` or `>` remain |
| 4 | Strips control characters U+0000–U+001F | Sanitization | Regex test passes |
| 5 | Preserves normal text | Happy path | Input equals output |
| 6 | Preserves Unicode (Arabic, emoji) | Internationalization | Characters unchanged |
| 7 | Handles empty string | Boundary | Returns empty string |
| 8 | Handles string of only tags | Boundary | Returns empty string |
| 9 | Strips Markdown injection (`[Click](javascript:...)`) | Security | No `javascript:` in output |

---

## Module 6: `lib/infrastructure/logger.ts` & `DataMasker`

| # | Test Case | Category | Assertion |
|---|-----------|----------|-----------|
| 1 | Masks email addresses | PII redaction | `test@example.com` → `t***@e***.com` |
| 2 | Masks steward IDs (pattern: `STW-XXXX`) | PII redaction | `STW-1234` → `STW-****` |
| 3 | Masks GPS coordinates | PII redaction | Coordinates replaced with `[REDACTED]` |
| 4 | Preserves non-PII text | Happy path | Unchanged |
| 5 | Handles string with multiple PII instances | Edge case | All instances masked |
| 6 | Handles empty string | Boundary | Returns empty string |
| 7 | Logger calls DataMasker before output | Integration | Spy confirms masker was called |

---

## Module 7: `app/actions/gemini.ts` (Server Action)

| # | Test Case | Category | Assertion |
|---|-----------|----------|-----------|
| 1 | Valid query returns `ok` Result with answer | Happy path | `result.ok === true` |
| 2 | Empty query returns `err` Result | Invalid input | `result.ok === false` |
| 3 | Gemini API failure returns `err` Result | Error handling | `result.ok === false`, no throw |
| 4 | Output is sanitized (no HTML) | Security | `sanitizeModelText` was called |
| 5 | Output passes `LLMResponseSchema` | Contract | Zod validation passes |
| 6 | Cached query returns stale value | Efficiency | SWR cache `get()` was called |
| 7 | Language parameter propagates to prompt | Correctness | Prompt string contains language |
| 8 | Rate-limited request returns appropriate error | Security | Error code is 'RATE_LIMITED' |

---

## Module 8: `middleware.ts`

| # | Test Case | Category | Assertion |
|---|-----------|----------|-----------|
| 1 | Response includes CSP header | Security | Header present and correct |
| 2 | Response includes HSTS header | Security | Header present |
| 3 | Response includes X-Frame-Options: DENY | Security | Header present |
| 4 | Response includes X-Content-Type-Options: nosniff | Security | Header present |
| 5 | Response includes Referrer-Policy | Security | Header present |
| 6 | Response includes Permissions-Policy | Security | Header present |
| 7 | Rate limiter blocks after 20 requests/minute | Rate limiting | 21st request returns 429 |
| 8 | Rate limiter resets after window expires | Rate limiting | Request succeeds after reset |

---

## E2E Tests (Playwright)

### `e2e/smoke.spec.ts`
| # | Test Case | Assertion |
|---|-----------|-----------|
| 1 | Homepage loads with correct `<h1>` | `h1` text matches |
| 2 | `/transit` loads with heatmap SVG | `svg` element exists |
| 3 | `/steward` loads with chat input | `input` element exists |
| 4 | Navigation between routes works | URL changes correctly |

### `e2e/a11y.spec.ts`
| # | Test Case | Assertion |
|---|-----------|-----------|
| 1 | Homepage has 0 axe violations | `violations.length === 0` |
| 2 | `/transit` has 0 axe violations | `violations.length === 0` |
| 3 | `/steward` has 0 axe violations | `violations.length === 0` |

### `e2e/keyboard.spec.ts`
| # | Test Case | Assertion |
|---|-----------|-----------|
| 1 | Tab from skip link to first nav item | Focus lands on nav link |
| 2 | Tab through `/steward` form | Focus reaches submit button |
| 3 | No focus traps on any page | Tab cycles back to skip link |
| 4 | Enter key submits steward query | Form submits successfully |
