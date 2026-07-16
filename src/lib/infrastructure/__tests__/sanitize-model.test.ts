/** Tests for sanitizeModelText — 9 test cases as per test-plan.md Module 5. */
import { describe, it, expect } from 'vitest';
import { sanitizeModelText } from '@/lib/infrastructure/sanitize-model';

describe('sanitizeModelText', () => {
  // Test 1: Strips <script> tags
  it('strips script tags', () => {
    const input = '<script>alert("xss")</script>Hello';

    expect(sanitizeModelText(input)).toBe('alert("xss")Hello');
  });

  // Test 2: Strips <img onerror=...>
  it('strips img tags with event handlers', () => {
    const input = '<img onerror="alert(1)" src="x">Safe text';

    expect(sanitizeModelText(input)).toBe('Safe text');
  });

  // Test 3: Strips all HTML tags
  it('strips all HTML tags', () => {
    const input = '<b>Bold</b> and <i>italic</i>';

    expect(sanitizeModelText(input)).toBe('Bold and italic');
  });

  // Test 4: Strips control characters
  it('strips control characters U+0000–U+001F', () => {
    const input = 'Hello\u0000\u0001\u0002World';

    expect(sanitizeModelText(input)).toBe('HelloWorld');
  });

  // Test 5: Preserves normal text
  it('preserves normal text unchanged', () => {
    const input = 'Gate A12 is on the north side.';

    expect(sanitizeModelText(input)).toBe(input);
  });

  // Test 6: Preserves Unicode (Arabic, emoji)
  it('preserves Unicode characters including Arabic and emoji', () => {
    const input = 'مرحبا بالعالم 🏟️⚽';

    expect(sanitizeModelText(input)).toBe(input);
  });

  // Test 7: Handles empty string
  it('returns empty string for empty input', () => {
    expect(sanitizeModelText('')).toBe('');
  });

  // Test 8: Handles string of only tags
  it('returns empty string when input is only HTML tags', () => {
    const input = '<div><span></span></div>';

    expect(sanitizeModelText(input)).toBe('');
  });

  // Test 9: Strips Markdown javascript: injection
  it('strips Markdown javascript: injection links', () => {
    const input = '[Click here](javascript:alert(1))';

    expect(sanitizeModelText(input)).toBe('Click here');
  });
});
