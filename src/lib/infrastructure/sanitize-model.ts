/**
 * Sanitization utility for LLM output.
 * Strips HTML tags, control characters, and Markdown injection patterns.
 * @module sanitize-model
 */

/** Pattern matching all HTML tags. */
const HTML_TAG_PATTERN = /<[^>]*>/g;

/** Pattern matching ASCII control characters (U+0000–U+001F), excluding newlines and tabs. */
const CONTROL_CHAR_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g;

/** Pattern matching javascript: URI schemes in Markdown links. */
const MARKDOWN_INJECTION_PATTERN = /\[([^\]]*)\]\(javascript:.*\)/gi;

/**
 * Sanitizes text output from an LLM to prevent XSS and injection attacks.
 * Strips HTML tags, control characters, and Markdown javascript: links.
 *
 * @param text - The raw text from the LLM response.
 * @returns The sanitized plain text, safe for rendering in the UI.
 *
 * @example
 * ```ts
 * sanitizeModelText('<script>alert("xss")</script>Hello')
 * // → 'Hello'
 *
 * sanitizeModelText('[Click](javascript:alert(1))')
 * // → 'Click'
 * ```
 */
export function sanitizeModelText(text: string): string {
  if (text.length === 0) {
    return text;
  }

  return text
    .replace(HTML_TAG_PATTERN, '')
    .replace(CONTROL_CHAR_PATTERN, '')
    .replace(MARKDOWN_INJECTION_PATTERN, '$1');
}
