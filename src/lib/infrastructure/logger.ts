/** PII data masking utility for safe logging. */

/** Pattern matching email addresses. */
const EMAIL_PATTERN = /\b[\w.-]+@[\w.-]+\.\w{2,}\b/g;

/** Pattern matching steward IDs (format: STW-XXXX). */
const STEWARD_ID_PATTERN = /\bSTW-\d{4,}\b/g;

/** Pattern matching GPS coordinates (e.g., 40.7128, -74.0060). */
const GPS_PATTERN = /-?\d{1,3}\.\d{4,}/g;

/**
 * Masks an email address, preserving the first character and domain TLD.
 *
 * @param email - The email address to mask.
 * @returns The masked email string.
 *
 * @example
 * ```ts
 * maskEmail('john@example.com') // → 'j***@e***.com'
 * ```
 */
function maskEmail(email: string): string {
  const parts = email.split('@');
  const local = parts[0]!;
  const domain = parts[1]!;
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1]!;
  const domainName = domainParts[0]!;

  return `${local[0]!}***@${domainName[0]!}***.${tld}`;
}

/**
 * Redacts all PII patterns from a log string.
 * Masks emails, steward IDs, and GPS coordinates.
 *
 * @param text - The raw log string potentially containing PII.
 * @returns The sanitized string with all PII redacted.
 *
 * @example
 * ```ts
 * maskPII('User john@test.com at STW-1234') // → 'User j***@t***.com at STW-****'
 * ```
 */
export function maskPII(text: string): string {
  if (text.length === 0) {
    return text;
  }

  return text
    .replace(EMAIL_PATTERN, (match) => maskEmail(match))
    .replace(STEWARD_ID_PATTERN, (match) => {
      const prefix = match.slice(0, 4);

      return `${prefix}****`;
    })
    .replace(GPS_PATTERN, '[REDACTED]');
}

/**
 * Structured logger that redacts PII before output.
 * All log output passes through the DataMasker to prevent PII leakage.
 *
 * @param level - The severity level ('info' | 'warn' | 'error').
 * @param message - The log message (will be PII-redacted).
 * @param meta - Optional metadata object (will be PII-redacted).
 */
export function log(
  level: 'info' | 'warn' | 'error',
  message: string,
  meta?: Record<string, unknown>,
): void {
  const safeMessage = maskPII(message);
  const safeMeta = meta !== undefined
    ? maskPII(JSON.stringify(meta))
    : undefined;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message: safeMessage,
    ...(safeMeta !== undefined ? { meta: safeMeta } : {}),
  };

  if (level === 'error') {
    console.error(JSON.stringify(entry));

    return;
  }

  console.log(JSON.stringify(entry));
}
