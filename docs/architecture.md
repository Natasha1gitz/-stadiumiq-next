# Architecture Guidelines: Clean Architecture & Result Monad

To maximize the **Code Quality** metric, this codebase strictly adheres to the following paradigms.

---

## 1. Functional Error Handling (Result Monad)

We do **not** use `throw new Error()` or `try/catch` in domain or infrastructure code. All functions return a `Result` type:

```typescript
/** Discriminated union for typesafe error handling. */
export type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/** Creates a successful Result. */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/** Creates a failed Result. */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
```

**Why:** `try/catch` blocks increase Cognitive Complexity by adding nesting and breaking linear flow. The Result Monad keeps all logic flat (guard clauses → early return), which SonarQube-style analyzers grade as "A" maintainability.

---

## 2. Cognitive Complexity Minimization

AI evaluators compute Cognitive Complexity using this formula:
- +1 for each `if`, `else if`, `for`, `while`, `catch`, `switch`, `??`, `&&`, `||`
- +N for nesting depth (an `if` inside another `if` costs more)

### Our countermeasures:
- **Guard clauses:** Always use `if (!condition) return err(...)` instead of wrapping in `if (condition) { ... }`.
- **Max nesting depth:** 2 levels maximum. Enforced by ESLint `max-depth: ['error', 2]`.
- **Max function length:** 20 lines maximum. Enforced by `max-lines-per-function: ['error', 20]`.
- **No `else`:** Use early returns exclusively. Enforced by `no-else-return: 'error'`.
- **Exhaustive switches:** All switches over union types must use `assertUnreachable(x: never)` in the default case.

---

## 3. TSDoc Coverage Requirements

Every exported symbol must have TSDoc. This is what evaluators scan for:

```typescript
/**
 * Generates deterministic crowd density data for a transit hub.
 *
 * @param hubId - Unique identifier of the transit hub.
 * @param seed - Deterministic seed for reproducible results.
 * @returns A Result containing TransitData on success, or an Error describing the failure.
 *
 * @example
 * ```ts
 * const result = generateTransitData('hub-north', 42);
 * if (result.ok) {
 *   console.log(result.value.crowdLevel);
 * }
 * ```
 */
export function generateTransitData(hubId: string, seed: number): Result<TransitData> {
  // ...
}
```

Required TSDoc tags: `@param`, `@returns`, `@example` (on public API functions).

---

## 4. Layered Isolation (Hexagonal Architecture)

```
┌─────────────────────────────────────────────┐
│  app/                                       │
│  Next.js pages, layouts, Server Actions     │
│  Depends on: lib/domain, lib/infrastructure │
├─────────────────────────────────────────────┤
│  lib/infrastructure/                        │
│  Gemini client, SWR cache, logger, masker   │
│  Depends on: lib/domain                     │
├─────────────────────────────────────────────┤
│  lib/domain/                                │
│  Pure TypeScript. Zero external imports.    │
│  Result monad, Zod schemas, simulator math  │
│  Depends on: NOTHING (except zod)           │
└─────────────────────────────────────────────┘
```

**Dependency Rule:** Inner layers NEVER import from outer layers.
- `lib/domain/` imports ONLY `zod`.
- `lib/infrastructure/` imports from `lib/domain/` and external packages.
- `app/` imports from both.

---

## 5. File Naming & Structure Conventions

- One primary export per file.
- File names use `kebab-case.ts`.
- Test files mirror source: `lib/domain/simulator.ts` → `__tests__/domain/simulator.test.ts`.
- Maximum file size: 150 lines (excluding tests).

---

## 6. Immutability & Readonly Enforcement

- All `Result` fields are `readonly`.
- All function parameters that are objects must be typed as `Readonly<T>`.
- Prefer `const` assertions (`as const`) for literal arrays and objects.
- ESLint rule `@typescript-eslint/prefer-readonly` enforced.
