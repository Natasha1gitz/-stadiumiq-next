# Contributing to StadiumIQ Next

Thank you for your interest in contributing to StadiumIQ Next! This guide explains
our standards and process.

## Development Setup

```bash
# Clone and install
git clone <repository-url>
cd stadiumiq-next
npm install

# Run dev server
npm run dev

# Run quality checks
npm run typecheck
npm run lint
npm run test
npm run test:e2e
```

## Quality Standards

All contributions must pass:

| Check | Command | Threshold |
|:------|:--------|:----------|
| TypeScript | `npm run typecheck` | Zero errors |
| ESLint | `npm run lint` | Zero errors, zero warnings |
| Unit Tests | `npm run test:coverage` | 100% lines/branches/functions/statements |
| Mutation Testing | `npm run test:mutation` | ≥ 80% kill rate |
| E2E Tests | `npm run test:e2e` | All pass |
| Accessibility | `npm run test:e2e` (axe-core) | Zero violations |

## Coding Conventions

- **No `any`** — use `unknown` and narrow with type guards.
- **Result monad** — use `ok()` / `err()` instead of `try/catch`.
- **Guard clauses** — use early returns, max 2 levels of nesting.
- **TSDoc** — all exported symbols must have JSDoc/TSDoc comments.
- **Naming** — files use `kebab-case`, types use `PascalCase`, functions use `camelCase`.

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(transit): add wheelchair vehicle availability indicator
fix(steward): prevent empty message submission
test(simulator): add boundary value tests for seed=0
docs: update architecture decision records
```

## Pull Request Process

1. Create a feature branch from `main`.
2. Ensure all quality gates pass locally.
3. Open a PR with a clear description of changes.
4. Address all review feedback.
5. Squash and merge after approval.

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.
