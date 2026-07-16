/**
 * Functional error handling via the Result Monad.
 * Eliminates try/catch for flat, predictable control flow.
 * @module result
 */

/**
 * Discriminated union for typesafe error handling.
 * Forces callers to check `.ok` before accessing `.value` or `.error`.
 */
export type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/**
 * Creates a successful Result wrapping the given value.
 *
 * @param value - The success payload.
 * @returns A Result with `ok: true`.
 *
 * @example
 * ```ts
 * const r = ok(42);
 * if (r.ok) console.log(r.value); // 42
 * ```
 */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/**
 * Creates a failed Result wrapping the given error.
 *
 * @param error - The error payload.
 * @returns A Result with `ok: false`.
 *
 * @example
 * ```ts
 * const r = err(new Error('fail'));
 * if (!r.ok) console.log(r.error.message); // 'fail'
 * ```
 */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/**
 * Compile-time exhaustiveness check for switch statements.
 * If this function is reachable, it means a union case was not handled.
 *
 * @param x - The value that should be of type `never`.
 * @throws Always throws — this is intentional for exhaustiveness.
 *
 * @example
 * ```ts
 * type Color = 'red' | 'blue';
 * function handle(c: Color) {
 *   switch (c) {
 *     case 'red': return 'R';
 *     case 'blue': return 'B';
 *     default: return assertUnreachable(c);
 *   }
 * }
 * ```
 */
export function assertUnreachable(x: never): never {
  throw new Error(`Unreachable case: ${String(x)}`);
}
